

#### javascript的六种继承方式

在 JavaScript 中，有多种继承方式可以实现面向对象编程。下面介绍六种常用的继承方式：

1. 原型链继承

原型链继承是通过将子类的原型指向父类的实例来实现继承的。这种方式的优点是可以继承父类的属性和方法，缺点是会共享父类的引用类型属性，容易造成修改父类属性对子类产生影响。

```javascript
function Parent() {
  this.name = 'parent';
  this.list = [1, 2, 3];
}

Parent.prototype.sayHello = function() {
  console.log('hello from parent');
}

function Child() {}

Child.prototype = new Parent();

var child1 = new Child();
var child2 = new Child();
console.log(child1.name); // parent
child1.list.push(4);
console.log(child2.list); // [1, 2, 3, 4]
```

2. 构造函数继承

构造函数继承是通过在子类中调用父类构造函数来实现继承的。这种方式的优点是可以避免共享父类的引用类型属性，缺点是不能继承父类原型中的方法。

```javascript
function Parent() {
  this.name = 'parent';
  this.list = [1, 2, 3];
}

function Child() {
  Parent.call(this);
}

var child1 = new Child();
var child2 = new Child();
console.log(child1.name); // parent
child1.list.push(4);
console.log(child2.list); // [1, 2, 3]
```

3. 组合继承

组合继承是将原型链继承和构造函数继承组合起来使用的一种继承方式。这种方式的优点是可以同时继承父类原型中的方法和父类构造函数中的属性，缺点是会调用两次父类构造函数。

```javascript
function Parent() {
  this.name = 'parent';
  this.list = [1, 2, 3];
}

Parent.prototype.sayHello = function() {
  console.log('hello from parent');
}

function Child() {
  Parent.call(this);
}

Child.prototype = new Parent();

var child1 = new Child();
var child2 = new Child();
console.log(child1.name); // parent
child1.list.push(4);
console.log(child2.list); // [1, 2, 3]
```

4. 原型式继承

原型式继承是通过借助原型来实现继承的。这种方式的优点是可以快速创建对象，缺点是无法实现复杂继承关系。

```javascript
var parent = {
  name: 'parent',
  list: [1, 2, 3]
};

var child1 = Object.create(parent);
var child2 = Object.create(parent);
console.log(child1.name); // parent
child1.list.push(4);
console.log(child2.list); // [1, 2, 3, 4]
```

5. 寄生式继承	

寄生式继承与原型式继承类似，都是基于已有对象创建新对象。寄生式继承的过程中，先创建一个用于封装继承过程的函数，然后将一个对象作为参数传入该函数，再对该对象进行扩展并返回，从而实现对该对象的继承。

```javascript
function inheritObject(o) {
  function F() {}
  F.prototype = o;
  return new F();
}

function createAnother(original) {
  let clone = inheritObject(original);
  clone.sayHi = function() {
    console.log('Hi');
  };
  return clone;
}

let person = {
  name: 'Jack',
  friends: ['Lucy', 'Lily']
};

let anotherPerson = createAnother(person);
console.log(anotherPerson.name); // Jack
anotherPerson.sayHi(); // Hi

```

在这个例子中，`createAnother`函数接受一个对象作为参数，返回一个新对象，新对象继承自原始对象。此时我们可以在新对象上添加新的属性或者方法。

寄生式继承的缺点与原型式继承相同，即无法实现复用方法，每次都要重新创建新的方法。因此，在实际应用中并不常见。



6. ES6 Class继承

ES6中引入了Class，可以更方便地实现面向对象的编程，也更加符合传统的面向对象语言的实现方式。ES6中的继承通过`extends`关键字实现，可以使用`super`关键字调用父类的构造函数和方法。

```javascript
class Parent {
  constructor(name) {
    this.name = name;
    this.colors = ['red', 'blue', 'green'];
  }

  sayName() {
    console.log(this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);
    this.age = age;
  }
}
```

以上是JavaScript的六种继承方式，每种方式都有其优缺点，开发者在实际开发中需要根据需求来选择适合的继承方式。

扩展：

1. es6的extends关键字的继承其原理是基于原型链的继承。

在 ES6 中，每个类都有一个 `prototype` 属性，该属性指向类的原型对象。原型对象中包含了类的属性和方法，以及指向其父类的原型对象的指针。当一个对象调用一个属性或方法时，如果该对象自身没有该属性或方法，那么 JavaScript 引擎会沿着原型链向上查找该属性或方法，直到找到或者到达原型链的末尾。

`extends` 关键字用于指定一个类继承自另一个类。在子类中使用 `extends` 关键字后面跟着父类的名称，子类就可以继承父类的所有属性和方法。子类会创建一个新的对象，该对象的原型会指向父类的原型，从而实现了对父类的继承。

当子类继承父类时，子类的构造函数会自动调用父类的构造函数来初始化父类中的属性。如果子类需要添加新的属性或方法，可以在子类的构造函数或原型对象中进行添加。

总之，ES6 的 `extends` 关键字基于原型链的继承实现了类的继承。子类通过继承父类的原型对象来获取父类的属性和方法，并可以扩展或修改父类的行为。

2. extends是如何避免修改父类引用的缺点的？

因为它在创建子类实例时，会先调用父类的构造函数来初始化父类的属性，然后再创建子类的属性和方法。这样，子类的实例和父类的实例就不再共享同一个引用类型的属性。

具体来说，ES6 中的 `extends` 关键字会创建一个新的派生类构造函数，并将其原型对象设置为父类的实例。在子类的构造函数中，通过 `super` 关键字调用父类的构造函数，可以初始化父类的属性，并且 `this` 关键字会指向子类的实例。然后，子类可以添加自己的属性和方法，不会影响到其他实例和子类。

总之，ES6 中的 `extends` 关键字通过创建新的派生类构造函数和调用父类构造函数来避免原型链继承的缺点，确保子类实例不会共享父类引用类型的属性，从而保证了继承的正确性和安全性。