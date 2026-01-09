import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';
import {
  calculateAllPelvicParameters,
  calculatePerpendicular
} from '../utils/pelvicCalculations';

const BaseAnnotationTool = cornerstoneTools.importInternal('base/BaseAnnotationTool');
const drawHandles = cornerstoneTools.importInternal('drawing/drawHandles');
const getNewContext = cornerstoneTools.importInternal('drawing/getNewContext');
const draw = cornerstoneTools.importInternal('drawing/draw');
const setShadow = cornerstoneTools.importInternal('drawing/setShadow');

/**
 * PelvicParameterTool - Custom tool for measuring pelvic parameters
 * Calculates: Sacral Slope (SS), Pelvic Tilt (PT), Pelvic Incidence (PI)
 */
export default class PelvicParameterTool extends BaseAnnotationTool {
  constructor(props = {}) {
    const defaultProps = {
      name: 'PelvicParameter',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      configuration: {
        drawHandles: true,
        drawHandlesOnHover: false,
        hideHandlesIfMoving: false,
        renderDashed: false,
      },
    };

    super(props, defaultProps);

    this.throttledUpdateCachedStats = cornerstoneTools.importInternal(
      'util/throttle'
    )(this.updateCachedStats, 110);
  }

  /**
   * Create new measurement data structure
   */
  createNewMeasurement(eventData) {
    const goodEventData =
      eventData && eventData.currentPoints && eventData.currentPoints.image;

    if (!goodEventData) {
      console.error(
        `${this.name}: required eventData not supplied to createNewMeasurement`
      );
      return;
    }

    return {
      visible: true,
      active: true,
      color: undefined,
      invalidated: true,
      handles: {
        // First click: Femoral head center
        femoralHead: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: true,
        },
        // Second click: Sacral endplate midpoint
        sacralMidpoint: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
        // Third click: Sacral line start
        sacralLineStart: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
        // Fourth click: Sacral line end
        sacralLineEnd: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
        // Text box for displaying measurements
        textBox: {
          active: false,
          hasMoved: false,
          movesIndependently: false,
          drawnIndependently: true,
          allowedOutsideImage: true,
          hasBoundingBox: true,
        },
      },
    };
  }

  /**
   * Check if a point is near the tool (for selection/interaction)
   */
  pointNearTool(element, data, coords, interactionType) {
    if (data.visible === false) {
      return false;
    }

    // Check each handle
    const handles = [
      data.handles.femoralHead,
      data.handles.sacralMidpoint,
      data.handles.sacralLineStart,
      data.handles.sacralLineEnd,
    ];

    for (const handle of handles) {
      if (handle) {
        const handleCanvas = cornerstone.pixelToCanvas(element, handle);
        const distance = cornerstoneMath.point.distance(handleCanvas, coords);
        if (distance < 25) {
          return true;
        }
      }
    }

    // Check if near sacral endplate line
    if (data.handles.sacralLineStart && data.handles.sacralLineEnd) {
      const lineStartCanvas = cornerstone.pixelToCanvas(
        element,
        data.handles.sacralLineStart
      );
      const lineEndCanvas = cornerstone.pixelToCanvas(
        element,
        data.handles.sacralLineEnd
      );
      const distanceToLine = cornerstoneMath.lineSegment.distanceToPoint(
        lineStartCanvas,
        lineEndCanvas,
        coords
      );
      if (distanceToLine < 25) {
        return true;
      }
    }

    return false;
  }

  /**
   * Update cached statistics when handles move
   */
  updateCachedStats(image, element, data) {
    const parameters = calculateAllPelvicParameters(data.handles);
    
    if (parameters) {
      data.cachedStats = {
        ss: parameters.ss,
        pt: parameters.pt,
        pi: parameters.pi,
      };
      data.invalidated = false;
    }
  }

  /**
   * Render the tool on the canvas
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const toolData = cornerstoneTools.getToolState(element, this.name);

    if (!toolData) {
      return;
    }

    const context = getNewContext(eventData.canvasContext.canvas);
    const { image } = eventData;

    // Iterate through each measurement
    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        setShadow(context, this.configuration);

        const color = cornerstoneTools.toolColors.getColorIfActive(data);

        // Draw all elements
        this.drawFemoralHeadPoint(context, element, data, color);
        this.drawSacralMidpoint(context, element, data, color);
        this.drawSacralEndplateLine(context, element, data, color);
        this.drawReferenceLines(context, element, data, color);
        this.drawMeasurementLines(context, element, data, color);

        // Draw handles
        const handleOptions = {
          color,
          handleRadius: 3,
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, eventData, data.handles, handleOptions);
        }

        // Update stats if needed
        if (data.invalidated === true) {
          if (data.cachedStats) {
            this.throttledUpdateCachedStats(image, element, data);
          } else {
            this.updateCachedStats(image, element, data);
          }
        }

        // Draw text box with measurements
        if (data.cachedStats) {
          this.drawTextBox(context, element, data, color);
        }
      });
    }
  }

  /**
   * Draw femoral head center point
   */
  drawFemoralHeadPoint(context, element, data, color) {
    if (!data.handles.femoralHead) return;

    const canvas = cornerstone.pixelToCanvas(element, data.handles.femoralHead);
    
    context.beginPath();
    context.arc(canvas.x, canvas.y, 5, 0, 2 * Math.PI);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();

    // Label
    context.fillStyle = color;
    context.font = '12px Arial';
    context.fillText('FH', canvas.x + 8, canvas.y - 8);
  }

  /**
   * Draw sacral midpoint
   */
  drawSacralMidpoint(context, element, data, color) {
    if (!data.handles.sacralMidpoint) return;

    const canvas = cornerstone.pixelToCanvas(element, data.handles.sacralMidpoint);
    
    context.beginPath();
    context.arc(canvas.x, canvas.y, 5, 0, 2 * Math.PI);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();

    // Label
    context.fillStyle = color;
    context.font = '12px Arial';
    context.fillText('S', canvas.x + 8, canvas.y - 8);
  }

  /**
   * Draw sacral endplate line
   */
  drawSacralEndplateLine(context, element, data, color) {
    if (!data.handles.sacralLineStart || !data.handles.sacralLineEnd) return;

    const startCanvas = cornerstone.pixelToCanvas(element, data.handles.sacralLineStart);
    const endCanvas = cornerstone.pixelToCanvas(element, data.handles.sacralLineEnd);

    context.beginPath();
    context.moveTo(startCanvas.x, startCanvas.y);
    context.lineTo(endCanvas.x, endCanvas.y);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  }

  /**
   * Draw reference lines (horizontal and vertical)
   */
  drawReferenceLines(context, element, data, color) {
    const canvasContext = context.canvas;
    
    // Horizontal reference line through sacral midpoint
    if (data.handles.sacralMidpoint) {
      const midpointCanvas = cornerstone.pixelToCanvas(element, data.handles.sacralMidpoint);
      
      context.save();
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(0, midpointCanvas.y);
      context.lineTo(canvasContext.width, midpointCanvas.y);
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
      context.restore();
    }

    // Vertical reference line through femoral head
    if (data.handles.femoralHead) {
      const fhCanvas = cornerstone.pixelToCanvas(element, data.handles.femoralHead);
      
      context.save();
      context.setLineDash([5, 5]);
      context.beginPath();
      context.moveTo(fhCanvas.x, 0);
      context.lineTo(fhCanvas.x, canvasContext.height);
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.stroke();
      context.restore();
    }
  }

  /**
   * Draw measurement lines (PT line and PI perpendicular)
   */
  drawMeasurementLines(context, element, data, color) {
    // PT line: From sacral midpoint to femoral head
    if (data.handles.sacralMidpoint && data.handles.femoralHead) {
      const sacralCanvas = cornerstone.pixelToCanvas(element, data.handles.sacralMidpoint);
      const fhCanvas = cornerstone.pixelToCanvas(element, data.handles.femoralHead);

      context.beginPath();
      context.moveTo(sacralCanvas.x, sacralCanvas.y);
      context.lineTo(fhCanvas.x, fhCanvas.y);
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.stroke();
    }

    // PI perpendicular line: Perpendicular to sacral endplate at midpoint
    if (data.handles.sacralLineStart && 
        data.handles.sacralLineEnd && 
        data.handles.sacralMidpoint) {
      
      const perp = calculatePerpendicular(
        data.handles.sacralLineStart,
        data.handles.sacralLineEnd
      );
      
      const sacralCanvas = cornerstone.pixelToCanvas(element, data.handles.sacralMidpoint);
      
      // Draw perpendicular line (extend it for visibility)
      const length = 50; // pixels
      const endX = sacralCanvas.x + perp.x * length;
      const endY = sacralCanvas.y + perp.y * length;

      context.beginPath();
      context.moveTo(sacralCanvas.x, sacralCanvas.y);
      context.lineTo(endX, endY);
      context.strokeStyle = color;
      context.lineWidth = 1.5;
      context.stroke();
    }
  }

  /**
   * Draw text box with measurements
   */
  drawTextBox(context, element, data, color) {
    if (!data.cachedStats) return;

    const { ss, pt, pi } = data.cachedStats;
    
    // Create text lines
    const textLines = [
      `SS: ${ss}°`,
      `PT: ${pt}°`,
      `PI: ${pi}°`,
    ];

    // Position text box near femoral head
    const fhCanvas = cornerstone.pixelToCanvas(element, data.handles.femoralHead);
    
    // Calculate text box position (offset from femoral head)
    const textX = fhCanvas.x + 15;
    const textY = fhCanvas.y - 40;

    // Draw text box background
    context.save();
    context.font = '14px Arial';
    
    const lineHeight = 18;
    const padding = 5;
    const maxWidth = Math.max(...textLines.map(line => context.measureText(line).width));
    const boxWidth = maxWidth + padding * 2;
    const boxHeight = textLines.length * lineHeight + padding * 2;

    // Background
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(textX, textY, boxWidth, boxHeight);

    // Border
    context.strokeStyle = color;
    context.lineWidth = 1;
    context.strokeRect(textX, textY, boxWidth, boxHeight);

    // Text
    context.fillStyle = color;
    textLines.forEach((line, index) => {
      context.fillText(
        line,
        textX + padding,
        textY + padding + (index + 1) * lineHeight - 3
      );
    });

    context.restore();
  }
}