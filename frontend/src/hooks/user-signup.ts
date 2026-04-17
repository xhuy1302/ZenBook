import { signUpApi } from '@/services/user/user.api'
import { useMutation } from '@tanstack/react-query'

export const useSignUp = () => {
  return useMutation({
    mutationFn: signUpApi
  })
}
