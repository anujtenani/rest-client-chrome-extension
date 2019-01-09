
function createPost(body){
    const form = new URLSearchParams();
    body.map(({name, value})=>{
        form.append(name, value);
        console.log('appending', name, value);
    });
    return form;
}

console.log(createPost([{name:'asdh298u$#@#s', value:'jashd8ay#@@##'}, {name:'1',value:'%^T@%^G^%RFVX@'}]));


fetch('http://localhost:8090/test/json').then(async (response)=>{
    const {headers, status, statusText} = response;
    const keys = headers.keys();
    console.log(keys);
    for(let key of keys){
        console.log(key);
    }
});

