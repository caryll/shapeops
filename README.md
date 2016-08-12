<p align="center"><img src="https://raw.githubusercontent.com/caryll/design/master/caryll-logo-libs-githubreadme.png" width=200></p><h1 align="center">caryll / shapeops</h1>
Boolean operations and overlap removal for curves.

## Usage

```javascript
var caryllShapeOps = require('caryll-shapeops');
var shape1 = [[
  {x:0, y:0, on:true}, 
  {x:100, y:0, on:false}, 
  {x:200, y:100, on:false}, 
  {x:200, y:200, on:true},
  {x:0, y:0, on:true}
], ...];
var shape2 = [...];
var result = caryllShapeOps.boole(caryllShapeOps.ops.intersection, shape1, shap2);
```

* `caryllShapeOps.boole(operator, shape1, shap2, fillRule1=caryllShapeOps.fillRules.evenodd, fillrule2=caryllShapeOps.fillRules.evenodd, resolution=100)` Perform boolean operation over `shape1` and `shape2` using given operator.
* `caryllShapeOps.removeOverlap(shape, fillRule=caryllShapeOps.fillrules.evenodd, resolution=100)` Remove overlap area under specified filling rule.