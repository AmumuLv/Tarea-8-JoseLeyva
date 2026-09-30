import axios from './axios';

export const getAreaProfile = () => axios.get('/area-profile');
export const changeAreaPassword = (data: { current_password: string; new_password: string; new_password_confirmation: string }) =>
  axios.put('/area-profile/password', data);
