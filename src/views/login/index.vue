<template>
  <div class="login">
    <van-nav-bar title="标题" />
    <ValidationObserver tag="form" ref="form">
      <ValidationProvider rules="required|phone" v-slot="{ errors }" tag="div" name="手机号">
        <van-field
          v-model="user.mobile"
          placeholder="请输入手机号"
          label="手机号"
          required
          clearable
          :error-message="errors[0]"
        />
        <span id="error">{{ errors[0] }}</span>
      </ValidationProvider>
      <ValidationProvider rules="required" v-slot="{ errors }" tag="div" name="验证码">
        <van-field
          v-model="user.code"
          placeholder="请输入验证码"
          label="验证码"
          type="password"
          required
          :error-message="errors[0]"
        />
        <span id="error">{{ errors[0] }}</span>
      </ValidationProvider>
    </ValidationObserver>

    <!-- <van-cell-group></van-cell-group>
    <van-cell-group></van-cell-group>-->

    <div class="login-wrap">
      <van-button type="info" :loading="isLoginLoading" loading-text="加载中..." @click="onLogin">登录</van-button>
    </div>
  </div>
</template>

<script>
import { login } from '@/api/user'
export default {
  name: 'LoginIndex',
  data () {
    return {
      user: {
        mobile: '15201230123',
        code: '246810'
      },
      isLoginLoading: false
    }
  },

  methods: {
    async onLogin () {
      try {
        // 表单验证
        const isValid = await this.$refs.form.validate()

        // 验证失败，则什么都不做
        if (!isValid) {
          return
        }
        this.isLoginLoading = true
        // 验证通过，提交表单
        const { data } = await login(this.user)

        console.log(data)
        this.$toast.success('登录成功')
      } catch (err) {
        if (err.response && err.response.status === 400) {
          this.$toast.fail('手机号或验证码错误')
        }
      }
      // 无论登录成功与否，都停止 loading
      this.isLoginLoading = false
    }
  }
}
</script>

<style lang="less" scoped>
.login {
  .login-wrap {
    padding: 20px;
    .van-button {
      width: 100%;
    }
  }
}
</style>
