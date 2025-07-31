interface ip{
    // labelStyle?:string,
    type:string,
    placeholder:string,
    ref?:any
    onChange?:any
}

export default function InputBox({onChange, type, placeholder, ref}: ip){

    return(<>
    <label className="text-[17px] mb-0.5 font-semibold" >{placeholder}</label>
        <input type={type} placeholder={placeholder} className="w-full p-0.5 px-6 text-[16px] font-mono mb-1 " ref={ref} onChange={onChange}/>
    </>
    )
}