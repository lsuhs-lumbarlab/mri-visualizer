import Point from './LinearAlgebra/Point';
import Vector from './LinearAlgebra/Vector';
import Matrix from './LinearAlgebra/Matrix';

export default class DicomGeometry {
  constructor(image) {
    this.image = image;

    try {
      // Extract DICOM metadata - Legacy Cornerstone uses image.data.string()
      const ippString = image.data.string('x00200032');
      const iopString = image.data.string('x00200037');
      const pixelSpacingString = image.data.string('x00280030');

      if (!ippString || !iopString || !pixelSpacingString) {
        console.warn('Missing required DICOM tags for reference lines');
        return;
      }

      const ipp = ippString.split('\\').map(v => parseFloat(v)); // Image Position Patient
      const iop = iopString.split('\\').map(v => parseFloat(v)); // Image Orientation Patient
      const pixelSpacing = pixelSpacingString.split('\\').map(v => parseFloat(v));

      this.spacingY = pixelSpacing[0];
      this.spacingX = pixelSpacing[1];

      this.rows = image.rows;
      this.cols = image.columns;

      this.lengthX = this.cols * this.spacingY;
      this.lengthY = this.rows * this.spacingX;

      this.rowDir = new Vector(iop[0], iop[1], iop[2]);
      this.colDir = new Vector(iop[3], iop[4], iop[5]);

      this.nrmDir = this.rowDir.crossProduct(this.colDir);

      this.topLeft = new Point(ipp[0], ipp[1], ipp[2]);
      this.topRight = this.topLeft.add(
        this.rowDir.mul(this.spacingX * this.cols)
      );
      this.bottomLeft = this.topLeft.add(
        this.colDir.mul(this.spacingY * this.rows)
      );
      this.bottomRight = this.bottomLeft.add(
        this.topRight.sub(this.topLeft)
      );

      this.transformImageToRcs = new Matrix(
        [
          this.rowDir.x * this.spacingX,
          this.colDir.x * this.spacingY,
          this.nrmDir.x,
          this.topLeft.x,
        ],
        [
          this.rowDir.y * this.spacingX,
          this.colDir.y * this.spacingY,
          this.nrmDir.y,
          this.topLeft.y,
        ],
        [
          this.rowDir.z * this.spacingX,
          this.colDir.z * this.spacingY,
          this.nrmDir.z,
          this.topLeft.z,
        ],
        [0, 0, 0, 1]
      );
      this.transformRcsToImage = this.transformImageToRcs.inverse();

      const p = this.nrmDir.round().abs();
      if (p.x === 1) this.orientation = 'sagittal';
      else if (p.y === 1) this.orientation = 'coronal';
      else if (p.z === 1) this.orientation = 'axial';

      this.isValid = true;
    } catch (error) {
      console.error('Error creating DicomGeometry:', error);
      this.isValid = false;
    }
  }
}