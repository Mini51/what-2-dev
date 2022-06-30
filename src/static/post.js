var form = document.getElementById('post-form');
// add event listener to the form
form.addEventListener('submit', function (e) {
    e.preventDefault();

    // get the title and content
    var title = document.getElementById('post-title');
    var description = document.getElementById('post-content');
    console.log(title.value);
    console.log(description.value);

    // fetch and wait for the response
    fetch('/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {title: title.value, description: description.value}
        )
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        Toastify({
            text: data.message,
            duration: 3000,            
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: "#157347",
            stopOnFocus: true,
            
        }).showToast();
    })
});
