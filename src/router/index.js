import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Form from '../views/Form.vue'
import Detail from '../views/Detail.vue'

const routes = [
  { path: '/', name: 'Form', component: Form },
  { path: '/detail', name: 'Detail', component: Detail }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})