import { useParams } from "react-router-dom";
export default function BikeOverview()   {

    const params = useParams();
    const [bike, setBike] = useState(null);
    const [status, setStatus] = useState("loading");
    
    return (
        <div className="w-full h-full flex items-center justify-center">
            <h1 className="text-2xl font-bold text-gray-800">Bike Overview - ID: {params.bikeid}</h1>
        </div>
    );
}