export default function Loginpage () {
    return (
        <div className="w-full h-screen bg-[url(./loginbg4.jpg)] bg-cover bg-center flex justify-center items-center">
            <div className="w-[500px] h-[600px] backdrop-blur-lg shadow-2xl rounded-2xl text-amber-100 flex flex-col justify-center items-center">
                <h1 className="text-4xl font-bold text-center mb-10">Login Page</h1>
                
                <div className="w-full flex flex-col justify-center items-center gap-6">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="w-[350px] h-[60px] rounded-md p-4 text-white bg-transparent border-2 border-none outline-none transition-all duration-300 hover:border-amber-200 hover:scale-105 focus:border-amber-100 focus:shadow-lg focus:shadow-amber-200/50 placeholder-amber-200"
                    />
                    
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="w-[350px] h-[60px] rounded-md p-4 text-white bg-transparent border-2 border-none outline-none transition-all duration-300 hover:border-amber-200 hover:scale-105 focus:border-amber-100 focus:shadow-lg focus:shadow-amber-200/50 placeholder-amber-200"
                    />
                    
                    <button className="w-[350px] h-[60px] rounded-md bg-amber-600 text-white font-bold text-xl transition-all duration-300 hover:bg-amber-500 hover:scale-105 hover:shadow-lg active:scale-95">
                        Login
                    </button>
                </div>
            </div>
        </div>
    )   
}
