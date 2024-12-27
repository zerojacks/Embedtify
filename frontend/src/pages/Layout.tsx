import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'

const Layout = () => {
    return (
        <div className="w-screen h-screen">
            <Navbar />
            <main className="py-4 mx-4">
                <Outlet />
            </main>
        </div>
    )
}

export default Layout