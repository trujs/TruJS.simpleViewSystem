/**[@test({ "title": "TruJS.simpleViewSystem._SimpleStyle: create style" })]*/
function testSimpleStyle1(arrange, act, assert, module) {
    var watcher, simpleStyle, template, context, style, cssText1, cssText2, cssText3;

    arrange(function () {
        watcher = module(["TruJS.simpleViewSystem._SimpleWatcher", []]);
        simpleStyle = module(["TruJS.simpleViewSystem._SimpleStyle", []]);
        template = [
            "{:$tagName:} {"
            , "background-color: {:colors.blue:};"
            , "    &.active {"
            , "        color: rgba(0,0,0,0.4);"
            , "    }"
            , "    "
            , "    [checked=true]"
            , "    {"
            , "        background-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABkCAYAAAAc5MdRAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8xOS8xN4L/NA8AAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAAFAHByVld4nO1YaXqbMBClda02ysRZEFLXU3An/851uEwP0M936Q2azoJAgOMGkMLXVhMWIeMZvXmaJf7x6/');"
            , "    }"
            , "}"
            , "p > .selector:not(.active) {"
            , "    "
            , "}"
            , "@supports (display: flex) {"
            , "     @media screen and (min-width: 900px) {"
            , "        article {"
            , "            display: flex;"
            , "        }"
            , "    }"
            , "}"

        ].join("\n");

        context = Object.create(watcher({
            "colors": {
                "blue": "#0000ff"
            }
        }), {
            "$tagName": {
                "enumerable": true
                , "value": "div"
            }
        });
    });

    act(function () {
        style = simpleStyle(template, context);
        cssText1 = style.innerText;
        context.colors.blue = "blue";
        cssText2 = style.innerText;

        style.$destroy();

        context.colors.blue = "green";

        cssText3 = style.innerText;
    });

    assert(function (test) {
        test("cssText1 should equal")
        .value(cssText1)
        .equals("\ndiv {\n\tbackground-color: #0000ff;\n}\n\ndiv.active {\n\tcolor: rgba(0,0,0,0.4);\n}\n\ndiv [checked=true] {\n\tbackground-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABkCAYAAAAc5MdRAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8xOS8xN4L/NA8AAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAAFAHByVld4nO1YaXqbMBClda02ysRZEFLXU3An/851uEwP0M936Q2azoJAgOMGkMLXVhMWIeMZvXmaJf7x6/');\n}\n\np > .selector:not(.active) {\n}\n\n@supports (display: flex) {\n\t@media screen and (min-width: 900px) {\n\t\t\tarticle {\n\t\t\t\tdisplay: flex;\n\t\t\t}\n\t}\n}\n");

        test("cssText2 should equal")
        .value(cssText2)
        .equals("\ndiv {\n\tbackground-color: blue;\n}\n\ndiv.active {\n\tcolor: rgba(0,0,0,0.4);\n}\n\ndiv [checked=true] {\n\tbackground-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABkCAYAAAAc5MdRAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8xOS8xN4L/NA8AAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAAFAHByVld4nO1YaXqbMBClda02ysRZEFLXU3An/851uEwP0M936Q2azoJAgOMGkMLXVhMWIeMZvXmaJf7x6/');\n}\n\np > .selector:not(.active) {\n}\n\n@supports (display: flex) {\n\t@media screen and (min-width: 900px) {\n\t\t\tarticle {\n\t\t\t\tdisplay: flex;\n\t\t\t}\n\t}\n}\n");

        test("cssText3 should equal")
        .value(cssText3)
        .equals("\ndiv {\n\tbackground-color: blue;\n}\n\ndiv.active {\n\tcolor: rgba(0,0,0,0.4);\n}\n\ndiv [checked=true] {\n\tbackground-image:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABkCAYAAAAc5MdRAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAxMi8xOS8xN4L/NA8AAAAfdEVYdFNvZnR3YXJlAE1hY3JvbWVkaWEgRmlyZXdvcmtzIDi1aNJ4AAAFAHByVld4nO1YaXqbMBClda02ysRZEFLXU3An/851uEwP0M936Q2azoJAgOMGkMLXVhMWIeMZvXmaJf7x6/');\n}\n\np > .selector:not(.active) {\n}\n\n@supports (display: flex) {\n\t@media screen and (min-width: 900px) {\n\t\t\tarticle {\n\t\t\t\tdisplay: flex;\n\t\t\t}\n\t}\n}\n");

    });
}