import {createBrowserRouter} from "react-router";
import Register from "./features/auth/pages/Register";
import Login from "./features/auth/pages/Login";
import CreateProduct from "./features/products/pages/CreateProduct";
import { TransitionLayout } from "./components/TransitionLayout";
import Dashboard from "./features/products/pages/Dashboard";

export const routes = createBrowserRouter([
    {
        path: "/",
        element: <TransitionLayout />,
        children: [
            {
                path: "/",
                element: <h1>Hello World</h1>
            },{
                path: '/register',
                element: <Register/>
            },{
                path: '/login',
                element: <Login/>
            }, {
                path: "/seller",
                children:[
                    {
                        path: "/seller/dashboard",
                        element: <Dashboard/>
                    },{
                        path: "/seller/create-product",
                        element: <CreateProduct/>
                    }
                ]
            }
        ]
    }
])