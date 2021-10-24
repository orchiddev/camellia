const Enum = require("../../lib/structures/typedefs/Enum");

let enumerator = new Enum(["KEY1", "KEY2", "KEY3"]);
let permissions = new Enum({
    NORMAL: 1,
    EXTENDED: 2,
    MODERATOR: 4
});

// NORMAL ENUMERATOR
console.log(enumerator.KEY1); // should return 0
console.log(enumerator.get(1)); // should return 1
console.log(enumerator.get("1")); // should return 1

enumerator.KEY1 = 2;
console.log(enumerator.KEY1); // should still return 0

console.log(enumerator.key(0)); // should return KEY1
console.log(enumerator.key("1")); // should return KEY2

// PERMISSIONS TEST
console.log(permissions.NORMAL); // should return 1
console.log(permissions.get(1)); // should return 1
console.log(permissions.get("2")); // should return 2

permissions.NORMAL = 2;
console.log(permissions.NORMAL); // should still return 1

console.log(permissions.key(1)); // should return NORMAL
console.log(permissions.key("2")); // should return EXTENDED