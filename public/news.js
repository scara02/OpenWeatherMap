document.getElementById('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('city').value;
    console.log(city)

    if (city) {
        await fetch('/news', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                city: city
            })
        })
            .then(res => {
                location.replace(res.url)
                console.log(res)
            })
            .catch(error => console.log(error))
    }
});