declare module '*.css' {
  const styles: { [className: string]: string };
  export default styles;
  export function getStyle(style: string): string;
}
