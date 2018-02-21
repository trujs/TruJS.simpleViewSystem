/**
*
* @factory
*/
function _CalcSizing(getComputedStyle, elementHelper) {

    /**
    * Creates the style object
    * @function
    */
    function createSizingObject(element, getScroll) {
        //get the computed styles
        var sizing = {}, compStyles = getComputedStyle(element), vert, horiz;
        //get the display and box sizing attributes
        sizing.display = compStyles.display;
        sizing.boxSizing = compStyles.boxSizing;
        //get the offsets
        sizing.offset = {
            parent: element.offsetParent
            , height: element.offsetHeight
            , width: element.offsetWidth
            , top: element.offsetTop
            , left: element.offsetLeft
        };
        //get the margin
        sizing.margin = {
            left: toNumVal(compStyles.marginLeft)
            , right: toNumVal(compStyles.marginRight)
            , top: toNumVal(compStyles.marginTop)
            , bottom: toNumVal(compStyles.marginBottom)
        };
        //get the border
        sizing.border = {
            left: toNumVal(compStyles.borderLeftWidth)
            , right: toNumVal(compStyles.borderRightWidth)
            , top: toNumVal(compStyles.borderTopWidth)
            , bottom: toNumVal(compStyles.borderBottomWidth)
        };
        //get the padding
        sizing.padding = {
            left: toNumVal(compStyles.paddingLeft)
            , right: toNumVal(compStyles.paddingRight)
            , top: toNumVal(compStyles.paddingTop)
            , bottom: toNumVal(compStyles.paddingBottom)
        };
        //get the scroll sizing
        sizing.scroll = {
            barWidth: getScroll !== false && getScrollbarWidth(element) || 0
            , height: element.scrollHeight
            , width: element.scrollWidth
            , left: element.scrollLeft
            , top: element.scrollTop
        };
        //get the initial height and width
        sizing.innerWidth = toNumVal(compStyles.width);
        sizing.innerHeight = toNumVal(compStyles.height);
        sizing.width = sizing.innerWidth;
        sizing.height = sizing.innerHeight;
        //translate the height and width
        if (sizing.boxSizing == 'border-box') {
            //width includes padding and border
            sizing.width = toNumVal(compStyles.width) - sizing.border.right - sizing.border.left;
            sizing.height = toNumVal(compStyles.height) - sizing.border.top - sizing.border.bottom;
            sizing.innerWidth = sizing.width - sizing.padding.left - sizing.padding.right;
            sizing.innerHeight = sizing.height - sizing.padding.top - sizing.padding.bottom;
        }
        else {
            //width is content only
            sizing.innerWidth = toNumVal(compStyles.width);
            sizing.innerHeight = toNumVal(compStyles.height);
            sizing.width = sizing.innerWidth + sizing.padding.right + sizing.padding.left;
            sizing.height = sizing.innerHeight + sizing.padding.top + sizing.padding.bottom;
        }
        //set the outer width and height
        sizing.outerWidth = sizing.width + sizing.border.left + sizing.border.right;
        sizing.outerHeight = sizing.height + sizing.border.top + sizing.border.bottom;
        //set the total width and height
        sizing.totalWidth = sizing.outerWidth + sizing.margin.left + sizing.margin.right;
        sizing.totalHeight = sizing.outerHeight + sizing.margin.top + sizing.margin.bottom;
        //see if any of the scrollbars are present
        vert = element.scrollTop > 0 || sizing.scroll.height > sizing.height;
        horiz = element.scrollLeft > 0 || sizing.scroll.width > sizing.width;
        //we should add the width of the vertical scroll bar to the total width
        if (vert) {
            sizing.totalWidth += sizing.scroll.barWidth.vert;
        }
        //we should add the width of the horizontal scroll bar to the total height
        if (horiz) {
            sizing.ttlHeight += sizing.scroll.barWidth.horiz;
        }
        //calculate the hidden area
        sizing.hidden = {
            height: sizing.scroll.height - sizing.height
            , width: sizing.scroll.width - sizing.width
            , top: sizing.scroll.top
            , bottom: 0
            , left: sizing.scroll.left
            , right: 0
        };
        sizing.hidden.bottom = sizing.hidden.height - sizing.hidden.top;
        sizing.hidden.right = sizing.hidden.width - sizing.hidden.left;
        //return the sizing
        return sizing;
    }
    /**
    * Converts a text size value npx to a number
    * @function
    * @param {String} val The value to convert
    */
    function toNumVal(val) {
       return parseInt(val.replace('px', '').trim());
    }
    /**
    * Calculates the scroll bar width
    * @function
    */
    function getScrollbarWidth(element) {
       //create an element to test with overflow hidden
       var el = elementHelper.create({
           "tag": 'div'
           , "target": element
           , "style": {
               "visibility": "hidden"
               , "width": "100px"
               , "height": "100px"
               , "position": "absolute"
               , "overflow": "scroll"
               , "msOverflowStyle": "scrollbar"
           }
           , "children": [{
               "tag": "div"
               , "style": {
                   "width": "101px"
                   , "height": "101px"
               }
           }]
       })
       , styles = getComputedStyle(el)
       ;
       //set the scrollbar width
       vertBarWidth = 100 - (el.clientWidth);
       horizBarWidth = 100 - (el.clientHeight);
       //cleanup
       elementHelper.destroy(el);
       //return the width
       return { horiz: horizBarWidth, vert: vertBarWidth };
    }

    /**
    * @worker
    */
    return function CalcSizing(element, getScroll) {
        return createSizingObject(element, getScroll);
    };
}