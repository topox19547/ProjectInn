import assert from "assert/strict";
import { it, mock } from 'node:test';
import { Vector2 } from "../model/gameObjects/Vector2.js";

it("vector library works",() => {
    const vector : Vector2 = new Vector2(0,0);
    const extraVector : Vector2 = new Vector2(1,1);
    assert(vector.equals(vector));
    assert(!vector.equals(extraVector));
    assert(vector.clone().equals(vector));
    assert(!extraVector.equals(vector));
    assert(vector.distanceTo(extraVector) == Math.sqrt(2));
    extraVector.multiplyByScalar(2);
    assert(extraVector.getX() == 2 && extraVector.getY() == 2);
    extraVector.translateBy(extraVector);
    assert(extraVector.getX() == 4 && extraVector.getY() == 4);
});