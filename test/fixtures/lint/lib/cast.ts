type Foo = { a: number };
export const toFoo = (x: unknown) => x as Foo;
