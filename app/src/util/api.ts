export async function get(endPoint: string) {
    let currentUrl = window.location.href.split("/");
    let fetchUrl = currentUrl[0] + "//" + currentUrl[2] + `/api/${endPoint}`;
    const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    return await response.json()
}

export async function post(endPoint: string, body: any) {
    let currentUrl = window.location.href.split("/");
    let fetchUrl = currentUrl[0] + "//" + currentUrl[2] + `/api/${endPoint}`;
    const response = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
    });
    return await response.json()
}