import * as cornerstone from 'cornerstone-core';
import DicomGeometry from '../utils/DicomGeometry';
import Point from '../utils/LinearAlgebra/Point';
import Line from '../utils/LinearAlgebra/Line';
import Matrix from '../utils/LinearAlgebra/Matrix';
import { areEqual } from '../utils/LinearAlgebra/utils';

export class ReferenceLines {
  constructor() {
    this.src = null;
    this.dst = null;
    this.isReferenceLine = false;
    this.plane = null;
    this.line = null;
  }

  build(srcImage, dstImage) {
    try {
      this.dst = new DicomGeometry(dstImage);
      this.src = new DicomGeometry(srcImage);

      this.isReferenceLine =
        this.dst.isValid &&
        this.src.isValid &&
        this.dst.orientation !== undefined &&
        this.src.orientation !== undefined &&
        this.dst.orientation !== this.src.orientation;

      return this.isReferenceLine;
    } catch (error) {
      console.error('Error building reference lines:', error);
      this.isReferenceLine = false;
      return false;
    }
  }

  buildLine() {
    if (!this.isReferenceLine) return null;

    try {
      const dst = this.dst;
      const src = this.src;

      const EPS = 1e-6;

      const pushUnique = (points, point) => {
        for (const existing of points) {
          const dx = existing.x - point.x;
          const dy = existing.y - point.y;
          const dz = existing.z - point.z;
          if (dx * dx + dy * dy + dz * dz < 1e-8) {
            return;
          }
        }
        points.push(point);
      };

      const clip01 = (t) => t >= -EPS && t <= 1 + EPS;

      const nP = dst.nrmDir.dotProduct(dst.topLeft);
      const nA = dst.nrmDir.dotProduct(src.topLeft);
      const nB = dst.nrmDir.dotProduct(src.topRight);
      const nC = dst.nrmDir.dotProduct(src.bottomRight);
      const nD = dst.nrmDir.dotProduct(src.bottomLeft);

      let list = [];

      if (!areEqual(nB, nA)) {
        const t = (nP - nA) / (nB - nA);
        if (clip01(t)) {
          pushUnique(
            list,
            src.topLeft.add(src.topRight.sub(src.topLeft).mul(Math.min(1, Math.max(0, t))))
          );
        }
      }

      if (!areEqual(nC, nB)) {
        const t = (nP - nB) / (nC - nB);
        if (clip01(t)) {
          pushUnique(
            list,
            src.topRight.add(
              src.bottomRight.sub(src.topRight).mul(Math.min(1, Math.max(0, t)))
            )
          );
        }
      }

      if (!areEqual(nD, nC)) {
        const t = (nP - nC) / (nD - nC);
        if (clip01(t)) {
          pushUnique(
            list,
            src.bottomRight.add(
              src.bottomLeft.sub(src.bottomRight).mul(Math.min(1, Math.max(0, t)))
            )
          );
        }
      }

      if (!areEqual(nA, nD)) {
        const t = (nP - nD) / (nA - nD);
        if (clip01(t)) {
          pushUnique(
            list,
            src.bottomLeft.add(
              src.topLeft.sub(src.bottomLeft).mul(Math.min(1, Math.max(0, t)))
            )
          );
        }
      }

      // The destination plane should cross the source rectangle twice.
      // Edge/corner hits can produce duplicates or >2 intersections.
      if (list.length < 2) return null;
      if (list.length > 2) {
        // Pick the two points with the largest separation
        let bestI = 0;
        let bestJ = 1;
        let bestDist2 = -1;
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const dx = list[i].x - list[j].x;
            const dy = list[i].y - list[j].y;
            const dz = list[i].z - list[j].z;
            const d2 = dx * dx + dy * dy + dz * dz;
            if (d2 > bestDist2) {
              bestDist2 = d2;
              bestI = i;
              bestJ = j;
            }
          }
        }
        list = [list[bestI], list[bestJ]];
      }

      // now back from 3D patient space to 2D pixel space
      const p = {
        startPoint: this.transformDstPatientPointToImage(list[0]),
        endPoint: this.transformDstPatientPointToImage(list[1]),
      };
      return p;
    } catch (error) {
      console.error('Error building line:', error);
      return null;
    }
  }

  transformDstPatientPointToImage(p) {
    const v = new Matrix([p.x], [p.y], [p.z], [1]);
    const transformed = this.dst.transformRcsToImage.multiply(v);
    const point = new Point(
      Math.round(transformed.get(0, 0)),
      Math.round(transformed.get(1, 0))
    );
    return point;
  }

  static clearCanvas(canvas) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  draw(canvas, element) {
    if (!canvas) return;

    const enabledElement = cornerstone.getEnabledElement(element);
    if (!enabledElement) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const line = this.buildLine();

      if (!line) return false;

      this.line = line;

      // Clear previous drawing only when we have a valid new line
      ctx.clearRect(0, 0, canvas.width, canvas.height);

       // Map from image pixel coordinates to canvas coordinates
      const startCanvas = cornerstone.pixelToCanvas(element, {
        x: line.startPoint.x,
        y: line.startPoint.y,
      });
      const endCanvas = cornerstone.pixelToCanvas(element, {
        x: line.endPoint.x,
        y: line.endPoint.y,
      });

      // Draw the main reference line (RED - solid)
      ctx.beginPath();
      ctx.setLineDash([]); // Solid line
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; // Red color
      ctx.moveTo(startCanvas.x, startCanvas.y);
      ctx.lineTo(endCanvas.x, endCanvas.y);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      return true;
    } catch (error) {
      console.error('Error drawing reference lines:', error);
      return false;
    }
  }
}