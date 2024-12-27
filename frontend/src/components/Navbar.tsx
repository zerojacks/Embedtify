import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <Link to="/" className="btn btn-ghost normal-case text-xl">
                    测试平台
                </Link>
                <Link to="/test-plans" className="btn btn-ghost normal-case text-xl">
                    测试方案
                </Link>
                <Link to="/exec-tested" className="btn btn-ghost normal-case text-xl">
                    测试结果
                </Link>
                <Link to="/devices" className="btn btn-ghost normal-case text-xl">
                    设备管理
                </Link>
            </div>
            <div className="flex-none">
                <ul className="menu menu-horizontal px-1">
                    <li><Link to="/">首页</Link></li>
                    {/* Add more navigation items */}
                </ul>
            </div>
        </div>
    )
}

export default Navbar