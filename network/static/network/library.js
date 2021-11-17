var lastForm = null;


document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('.fa-heart').forEach(div => {
        div.onclick = function () {
            like(this);
        };
    });

    //Thanks to the folks at the CS50 Discord for hints on this bit:
    document.querySelectorAll("[id^='frm_edit_']").forEach(form => {

        form.onsubmit = function (e) {

            e.preventDefault();
            this.querySelector('#div_buttons').style.display = "none";
            if (this.querySelector('#alert_message') != null) {
                this.querySelector('#alert_message').remove();
            }

            let alert = this.querySelector('#post_text_alert_' + this.dataset.id);

            let input = this.querySelector('div>textarea');
            if (input.value.trim().length == 0) {
                alertMessage({
                    'error': 'The field is required.'
                }, alert, this.dataset.id);
                this.querySelector('#div_buttons').style.display = "";
                return 0;
            }

            var formData = $(this).serialize();
            let csrftoken = this.querySelector("input[name='csrfmiddlewaretoken']").value;
            fetch(`/editpost/${this.dataset.id}`, {
                    method: 'POST',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        "X-CSRFToken": csrftoken
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {

                    alertMessage(data, alert, this.dataset.id);
                    this.querySelector('#div_buttons').style.display = "";
                }).catch((error) => {
                    alertMessage({
                        'error': error.message
                    }, alert, this.dataset.id);
                    this.querySelector('#div_buttons').style.display = "";
                });
        }

    });

    
    document.querySelectorAll("[id^='edit_link_']").forEach(a => {
        a.onclick = function () {
            if (lastForm != null) {
                hideForm(lastForm);
            }
            lastForm = this;
            let p = document.querySelector('#post_text_' + this.dataset.id);
            let form = document.querySelector('#frm_edit_' + this.dataset.id);
            p.style.display = 'none';
            form.querySelector('#id_post_edit_text').value = p.innerHTML;
            form.style.display = '';
        };

    });



    
    document.querySelectorAll("[id^='btn_close_']").forEach(a => {
        a.onclick = function () {
            hideForm(this);
        };

    });


    if (document.getElementById("btnfollow")) {
        document.querySelector('#btnfollow').addEventListener("click", function (event) {
            fetch(`/follow/${this.dataset.id}`)
                .then(response => response.json())
                .then(data => {
                    document.querySelector('#sp_followers').innerHTML = data.total_followers;
                    if (data.result == "follow") {
                        this.innerHTML = "Following";
                        this.className = "btn btn-primary";
                    } else {
                        this.innerHTML = "Follow";
                        this.className = "btn btn-outline-primary";
                    }
                });

        })

        
        document.querySelector('#btnfollow').addEventListener("mouseover", function (event) {
            if (this.className == "btn btn-primary") {
                this.innerHTML = "Unfollow"
            }
        });

        
        document.querySelector('#btnfollow').addEventListener("mouseleave", function (event) {
            if (this.className == "btn btn-primary") {
                this.innerHTML = "Following"
            }
        });

    }
    

    async function like(element) {
        await fetch(`/like/${element.dataset.id}`)
            .then(response => response.json())
            .then(data => {
                element.className = data.css_class;
                element.querySelector('small').innerHTML = data.total_likes;
            });
    }
    



    function hideForm(element) {
        let p = document.querySelector('#post_text_' + element.dataset.id);
        let form = document.querySelector('#frm_edit_' + element.dataset.id);
        p.style.display = '';
        form.querySelector('#id_post_edit_text').value = p.innerHTML;
        form.style.display = 'none';
    }

    
    function alertMessage(data, alert, id) {
        let div = document.createElement('div');
        let sucess = false;
        div.setAttribute('role', 'alert');
        div.setAttribute('id', 'alert_message');
        if (document.getElementById('alert_message') == null) {
            if (data.error) {
                if (data.error.id_post_edit_text) {
                    div.innerHTML = data.error.id_post_edit_text.join();
                } else {
                    div.innerHTML = data.error;
                }
                div.className = 'alert alert-dismissible fade alert-danger in show';
            } else {
                sucess = true;
                document.querySelector('#post_text_' + id).innerHTML = data.text;
                div.innerHTML = "Post changed successfully!";
                div.className = 'alert alert-dismissible fade alert-success in show';
            }
        }
        alert.appendChild(div);
        var alert_message = document.getElementById('alert_message');
        setTimeout(function () {
            if (alert_message != null) {
                $(alert_message).fadeOut("fast");
                alert_message.remove();
                if (sucess) {
                    document.querySelector('#frm_edit_' + id).style.display = 'none';
                    document.querySelector('#post_text_' + id).style.display = '';
                }
            }
        }, 
        1000);
    }
});