<template>
  <div>
    <van-nav-bar
      title="个人信息"
      left-arrow
      right-text="保存"
      @click-right="onSaveProfile"
      @click-left="$router.back()"
    />
    <!-- 用户信息 -->
    <van-cell-group>
      <van-cell title="头像" is-link @click="onShowFile">
        <van-image round width="30" height="30" :src="user.photo" />
      </van-cell>
      <van-cell title="昵称" :value="user.name" is-link @click="isEditNameShow = true" />
      <van-cell
        title="性别"
        :value="user.gender === 1 ? '女' : '男'"
        is-link
        @click="isEditGenderShow = true"
      />
      <van-cell title="生日" :value="user.birthday" is-link @click="isEditBirthdayShow = true" />
    </van-cell-group>
    <!-- /用户信息 -->
    <input hidden type="file" ref="file" />
    <!-- 编辑用户昵称 -->
    <van-dialog
      v-model="isEditNameShow"
      title="用户昵称"
      show-cancel-button
      @confirm="user.name = inputUserName"
    >
      <van-field :value="user.name" placeholder="请输入用户名" @input="onUserNameInput" />
    </van-dialog>
    <!-- 编辑用户昵称 -->
    <!-- 编辑用户性别 -->
    <van-action-sheet
      v-model="isEditGenderShow"
      :actions="[
        { name: '男', value: 0 },
        { name: '女', value: 1 }
      ]"
      cancel-text="取消"
      @select="onGenderSelect"
    />
    <!-- /编辑用户性别 -->
    <!-- 编辑用户生日 -->
    <van-popup v-model="isEditBirthdayShow" position="bottom" :style="{ height: '30%' }">
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        :min-date="minDate"
        @confirm="onDatetimeConfirm"
        @cancel="isEditBirthdayShow = false"
      />
    </van-popup>
    <!-- /编辑用户生日 -->
  </div>
</template>

<script>
import { getProfile, updateUserPhoto, updateUserProfile } from '@/api/user'
import { formatDate } from '@/utils/date'
export default {
  name: 'UserIndex',
  data () {
    return {
      user: {}, // 用户个人资料

      isEditNameShow: false, // 是否显示编辑昵称
      inputUserName: '', // 存储编辑用户输入的内容

      isEditGenderShow: false, // 是否显示编辑性别

      isEditBirthdayShow: false, // 是否显示编辑生日
      minDate: new Date(1870, 1, 1), // 可选的最小时间(一个小技巧，生成指定日期的日期对象)
      currentDate: new Date() // 默认被选中的时间
    }
  },
  computed: {
    file () {
      return this.$refs.file
    }
  },
  methods: {
    async loadUserProfile () {
      const { data } = await getProfile()
      this.user = data.data
    },
    onShowFile () {
      // 手动触发 input 的点击事件
      this.file.click()
    },
    async onSaveProfile () {
      const toast = this.$toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true, // 禁用背景点击
        loadingType: 'spinner',
        message: '更新中'
      })
      try {
        // 如果用户上传了头像才请求提交更新用户头像
        const photo = this.file.files[0]
        if (photo) {
          await updateUserPhoto(this.file.files[0])
        }
        // 更新普通数据信息（昵称、性别、生日）
        await updateUserProfile(this.user)
        // 关闭弹窗 loading
        toast.clear()
        this.$toast.success('更新成功')
      } catch (err) {
        // 关闭弹窗 loading
        toast.clear()
        this.$toast.fail('更新失败')
      }
    },
    onUserNameInput (value) {
      this.inputUserName = value
    },
    onGenderSelect (item) {
      this.user.gender = item.value
      this.isEditGenderShow = false
    },
    onDatetimeConfirm (value) {
      this.user.birthday = formatDate(value)
      this.isEditBirthdayShow = false
    }
  },
  // 初始化的时候操作 DOM
  mounted () {
    // 注册 file 的 change 事件，预览图片
    this.file.onchange = () => {
      this.user.photo = window.URL.createObjectURL(this.file.files[0])
    }
  },
  created () {
    this.loadUserProfile()
  }
}
</script>
