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

      const nP = dst.nrmDir.dotProduct(dst.topLeft);
      const nA = dst.nrmDir.dotProduct(src.topLeft);
      const nB = dst.nrmDir.dotProduct(src.topRight);
      const nC = dst.nrmDir.dotProduct(src.bottomRight);
      const nD = dst.nrmDir.dotProduct(src.bottomLeft);

      let list = [];

      if (!areEqual(nB, nA)) {
        const t = (nP - nA) / (nB - nA);
        if (t > 0 && t <= 1)
          list.push(src.topLeft.add(src.topRight.sub(src.topLeft).mul(t)));
      }

      if (!areEqual(nC, nB)) {
        const t = (nP - nB) / (nC - nB);
        if (t > 0 && t <= 1)
          list.push(src.topRight.add(src.bottomRight.sub(src.topRight).mul(t)));
      }

      if (!areEqual(nD, nC)) {
        const t = (nP - nC) / (nD - nC);
        if (t > 0 && t <= 1)
          list.push(
            src.bottomRight.add(src.bottomLeft.sub(src.bottomRight).mul(t))
          );
      }

      if (!areEqual(nA, nD)) {
        const t = (nP - nD) / (nA - nD);
        if (t > 0 && t <= 1)
          list.push(src.bottomLeft.add(src.topLeft.sub(src.bottomLeft).mul(t)));
      }

      // the destination plane should have been crossed exactly two times
      if (list.length !== 2) return null;

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

      if (!line) return;

      this.line = line;

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
      ctx.lineWidth = 1;
      ctx.stroke();
    } catch (error) {
      console.error('Error drawing reference lines:', error);
    }
  }
}