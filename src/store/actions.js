import axios from 'axios'

export const getPost = ({ commit }, id) => {
    return axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`).then((response) => {
        commit('setPost', response.data)
    })
}
