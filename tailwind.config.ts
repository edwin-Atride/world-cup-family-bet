import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./lib/**/*.{js,ts,jsx,tsx,mdx}'], theme: { extend: { colors: { fifaBlue:'#041E42', fifaGold:'#C8AA6E', fifaRed:'#E4002B', pitch:'#0B6B3A' }, boxShadow:{ glow:'0 20px 60px rgba(200,170,110,.18)' } } }, plugins: [] };
export default config;
