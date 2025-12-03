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
    this.currentSliceLine = null;
    this.firstSliceLine = null;
    this.lastSliceLine = null;
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

  buildLineForImage(srcGeometry) {
    if (!this.dst || !this.dst.isValid) return null;

    try {
      const dst = this.dst;

      const nP = dst.nrmDir.dotProduct(dst.topLeft);
      const nA = dst.nrmDir.dotProduct(srcGeometry.topLeft);
      const nB = dst.nrmDir.dotProduct(srcGeometry.topRight);
      const nC = dst.nrmDir.dotProduct(srcGeometry.bottomRight);
      const nD = dst.nrmDir.dotProduct(srcGeometry.bottomLeft);

      let list = [];

      if (!areEqual(nB, nA)) {
        const t = (nP - nA) / (nB - nA);
        if (t > 0 && t <= 1)
          list.push(srcGeometry.topLeft.add(srcGeometry.topRight.sub(srcGeometry.topLeft).mul(t)));
      }

      if (!areEqual(nC, nB)) {
        const t = (nP - nB) / (nC - nB);
        if (t > 0 && t <= 1)
          list.push(srcGeometry.topRight.add(srcGeometry.bottomRight.sub(srcGeometry.topRight).mul(t)));
      }

      if (!areEqual(nD, nC)) {
        const t = (nP - nC) / (nD - nC);
        if (t > 0 && t <= 1)
          list.push(
            srcGeometry.bottomRight.add(srcGeometry.bottomLeft.sub(srcGeometry.bottomRight).mul(t))
          );
      }

      if (!areEqual(nA, nD)) {
        const t = (nP - nD) / (nA - nD);
        if (t > 0 && t <= 1)
          list.push(srcGeometry.bottomLeft.add(srcGeometry.topLeft.sub(srcGeometry.bottomLeft).mul(t)));
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

  buildLine() {
    return this.buildLineForImage(this.src);
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

  draw(canvas) {
    if (!this.isReferenceLine) return;

    try {
      const ctx = canvas.getContext('2d');

      // Build line for current slice
      this.currentSliceLine = this.buildLine();

      if (!this.currentSliceLine) return;

      // Draw the current slice reference line (RED)
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)'; // Red
      ctx.moveTo(this.currentSliceLine.startPoint.x, this.currentSliceLine.startPoint.y);
      ctx.lineTo(this.currentSliceLine.endPoint.x, this.currentSliceLine.endPoint.y);
      ctx.lineWidth = 2;
      ctx.stroke();

    } catch (error) {
      console.error('Error drawing reference lines:', error);
    }
  }

  // New method to draw first and last slice boundaries
  drawBoundaries(canvas, firstSliceImage, lastSliceImage) {
    if (!this.dst || !this.dst.isValid) return;

    try {
      const ctx = canvas.getContext('2d');

      // Build geometry for first slice
      if (firstSliceImage) {
        const firstGeometry = new DicomGeometry(firstSliceImage);
        if (firstGeometry.isValid) {
          const firstLine = this.buildLineForImage(firstGeometry);
          if (firstLine) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'; // Green
            ctx.moveTo(firstLine.startPoint.x, firstLine.startPoint.y);
            ctx.lineTo(firstLine.endPoint.x, firstLine.endPoint.y);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // Build geometry for last slice
      if (lastSliceImage) {
        const lastGeometry = new DicomGeometry(lastSliceImage);
        if (lastGeometry.isValid) {
          const lastLine = this.buildLineForImage(lastGeometry);
          if (lastLine) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)'; // Green
            ctx.moveTo(lastLine.startPoint.x, lastLine.startPoint.y);
            ctx.lineTo(lastLine.endPoint.x, lastLine.endPoint.y);
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

    } catch (error) {
      console.error('Error drawing boundary lines:', error);
    }
  }
}