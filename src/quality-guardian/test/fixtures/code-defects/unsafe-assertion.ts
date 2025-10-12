const user: unknown = {};
const name = (user as any).name;

let element: HTMLElement | null = null;
element!.focus(); // Non-null assertion
