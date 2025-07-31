interface btn{
    text:string,
    style:string,
    onClick?:any,
}

export default function Button({text,style,onClick}:btn){
    return(
        <button className={style} onClick={onClick}>{text}</button>
    )
}