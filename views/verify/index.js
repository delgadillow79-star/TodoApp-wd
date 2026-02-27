const { default: axios } = require("axios");

( async () => {
    try {
    const token = window.location.pathname.split('/')[2];
    const { data } = await axios.patch(`/api/users/${token}`);
    console.log (data);
    } catch (error) {
     console.log(error.reponse.data.error);
    }
    
});