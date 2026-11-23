type Foo = { a: number };
declare const x: unknown;
const a: any = 1;
const b = x as Foo;
// @ts-ignore
const c: number = "no";
export const Card = () => <div style={{ color: "#ff0000" }} className="w-[37px]">{String(a)}{String(b)}{c}</div>;
