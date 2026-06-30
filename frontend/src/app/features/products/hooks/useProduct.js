import {createProduct, getSellerProducts, getAllProducts} from "../services/product.api.js";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from "../state/product.slice.js";



export const useProduct = ()=>{
    const dispatch = useDispatch();

    async function handleCreateProduct(formData){
        const data = await createProduct(formData);

        return data.product;
    }

    async function handleGetSellerProduct(){
        const data = await getSellerProducts()
        dispatch(setSellerProducts(data.products))
        return data.products;
    }
    // this handleGetSellerProduct calls the API and share the data with the slice.


    async function handleGetAllProducts(){
        const data = await getAllProducts()
        dispatch(setProducts(data.products))
        return data.products;
    }
    // this handleGetAllProducts calls the API and share the data with the slice.
    

    return {
        handleCreateProduct,
        handleGetSellerProduct,
        handleGetAllProducts
    }
} 