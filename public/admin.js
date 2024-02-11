document.getElementById('addForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    await fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            password: password,
        })
    })
        .then(res => {
            location.replace(res.url)
        })
        .catch(error => console.log(error))
});

async function update(id) {
    const newUsername = document.getElementById("updateUser_" + id).value;
    const newPassword = document.getElementById("updatePass_" + id).value;

    await fetch('/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId: id,
            username: newUsername,
            password: newPassword,
        })
    })
        .then(res => {
            location.replace(res.url)
        })
        .catch(error => console.log(error))
}

async function deleteUser(id) {
        await fetch('/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: id,
            })
        })
        .then(res => {
            location.replace(res.url);
        })
        .catch(error => console.error(error));
}
