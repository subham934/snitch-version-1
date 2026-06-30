Today, we will transform the UI to a light background.

=> today, we will see the products created by seller.


Today, the seller will see the products he have created. but before that , let's make the entire website a little more professional by adding a light background color to it. So , we'll change the UI and make it more appealing, and for that , we will be using Antigravity.  

-> it will be displayed in Dashboard.jsx (which will also be created with antigravity), which you can see in frontend/src/app/features/products/pages/Dashboard.jsx


1. create product page
    a. folder Pages ✅
    b. /pages/CreateProduct.jsx ✅
    c. UI of the page✅
2. view products
    a. folder Pages ✅
    b. /pages/Dashboard.jsx ✅
3. make page protected 
    a. create protected component
    b. wrap  , create product page and seller dashboard. ✅
4. create product hook ✅
    a. import all the service functions ✅
    b. create functions: handleCreateProduct, handleGetSellerProducts ✅

5. manage product state ✅
    a. create product slice✅
        i. features/products/product.slice.js ✅
        
    b. use productg slice in store.✅

6. integrate Backend APIs.✅
    a. /features/products/services/product.api.js ✅
    b. Create function to interact with API ✅
        i. function for creating product ✅ 
        ii. function for getting seller products ✅


also, create a new Route for both Dashboard.jsx and CreateProduct.jsx.  


-------------------------------
frontend/src/app/app.routes.jsx
-------------------------------


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


now, i need to make sure that the buyer can't see the Dashboard and CreateProduct page. for that we need to make the pages protected


