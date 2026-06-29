import { Nav } from './Nav';
export function AppShell({children,isAdmin=false}:{children:React.ReactNode;isAdmin?:boolean}){ return <><main className="mx-auto max-w-3xl px-4 pt-6 pb-28">{children}</main><Nav isAdmin={isAdmin}/></> }
