import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';

const BaseAnnotationTool = cornerstoneTools.importInternal('base/BaseAnnotationTool');
const drawHandles = cornerstoneTools.importInternal('drawing/drawHandles');
const getNewContext = cornerstoneTools.importInternal('drawing/getNewContext');
const draw = cornerstoneTools.importInternal('drawing/draw');
const setShadow = cornerstoneTools.importInternal('drawing/setShadow');

/**
 * PelvicParameterTool - Simple single point tool
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
  }

  /**
   * Create new measurement - just a single point
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
        femoralHead: {
          x: eventData.currentPoints.image.x,
          y: eventData.currentPoints.image.y,
          highlight: true,
          active: false,
        },
      },
    };
  }

  /**
   * Check if a point is near the tool
   */
  pointNearTool(element, data, coords) {
    if (data.visible === false) {
      return false;
    }

    const handleCanvas = cornerstone.pixelToCanvas(element, data.handles.femoralHead);
    const distance = cornerstoneMath.point.distance(handleCanvas, coords);
    
    return distance < 25;
  }

  /**
   * Render the tool
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const element = eventData.element;
    const toolData = cornerstoneTools.getToolState(element, this.name);

    if (!toolData) {
      return;
    }

    const context = getNewContext(eventData.canvasContext.canvas);

    for (let i = 0; i < toolData.data.length; i++) {
      const data = toolData.data[i];

      if (data.visible === false) {
        continue;
      }

      draw(context, (context) => {
        setShadow(context, this.configuration);

        const color = cornerstoneTools.toolColors.getColorIfActive(data);

        // Draw the point
        const canvas = cornerstone.pixelToCanvas(element, data.handles.femoralHead);
        
        context.beginPath();
        context.arc(canvas.x, canvas.y, 5, 0, 2 * Math.PI);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();

        // Draw label
        context.fillStyle = color;
        context.font = '12px Arial';
        context.fillText('FH', canvas.x + 8, canvas.y - 8);

        // Draw handles
        const handleOptions = {
          color,
          handleRadius: 3,
        };

        if (this.configuration.drawHandles) {
          drawHandles(context, eventData, data.handles, handleOptions);
        }
      });
    }
  }
}