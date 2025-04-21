<template>
	<div class="nutrition-calculator">
		<h1>营养素计算器</h1>
		<div class="form">
			<div class="input-section nickname-section">
				<label for="nickname">昵称</label>
				<input
					type="text"
					id="nickname"
					v-model.trim="niCheng"
					placeholder="请输入昵称"
					:class="{ 'invalid-input': validationAttempted && !isNicknameValid }"
					@input="resetNicknameValidation" />
			</div>
			<div class="input-section">
				<label for="weight">体重</label>
				<input
					type="number"
					id="weight"
					v-model.number="tiZhong"
					placeholder="请输入体重(kg)"
					min="1"
					:class="{ 'invalid-input': validationAttempted && !isWeightValid }"
					@input="resetWeightValidation" />
			</div>
			<div class="input-section mode-selection">
				<label>目标</label>
				<div class="mode-buttons">
					<div
						class="button"
						@click="xuanZeMoShi('jianZhi')"
						:class="{ active: moShi === 'jianZhi' }">
						减脂
					</div>
					<div
						class="button"
						@click="xuanZeMoShi('zengJi')"
						:class="{ active: moShi === 'zengJi' }">
						增肌
					</div>
				</div>
			</div>
			<div class="input-section">
				<button
					@click="jiSuanBingBaoCun"
					class="calculate-button">
					计算每餐营养素
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { store } from '../store'

const router = useRouter()

const niCheng = ref(store.niCheng)
const tiZhong = ref(store.tiZhong)
const moShi = ref(store.moShi)
const tanShui = ref(store.tanShui)
const danBai = ref(store.danBai)
const zhiFang = ref(store.zhiFang)
const zongReLiang = ref(store.zongReLiang)
const yiJiSuan = ref(store.yiJiSuan)

const isNicknameValid = ref(true)
const isWeightValid = ref(true)
const validationAttempted = ref(false)

const JIANZHI_TANSHUI_MEI_KG = 1.0
const JIANZHI_DANBAI_MEI_KG = 0.6
const JIANZHI_ZHIFANG_MEI_KG = 0.4
const ZENGJI_TANSHUI_MEI_KG = 2.0
const ZENGJI_DANBAI_MEI_KG = 0.6
const ZENGJI_ZHIFANG_MEI_KG = 0.4
const RELIANG_MEI_KE_TANSHUI = 4
const RELIANG_MEI_KE_DANBAI = 4
const RELIANG_MEI_KE_ZHIFANG = 9

const xuanZeMoShi = xuanZeDeMoShi => {
	moShi.value = xuanZeDeMoShi
	store.moShi = xuanZeDeMoShi
}

const resetNicknameValidation = () => {
	if (validationAttempted.value) {
		isNicknameValid.value = true
	}
}

const resetWeightValidation = () => {
	if (validationAttempted.value) {
		isWeightValid.value = true
	}
}

const yanZhengShuRu = () => {
	let isValid = true
	validationAttempted.value = true

	if (!niCheng.value) {
		isNicknameValid.value = false
		isValid = false
	} else {
		isNicknameValid.value = true
	}

	if (!tiZhong.value || tiZhong.value <= 0) {
		isWeightValid.value = false
		isValid = false
	} else {
		isWeightValid.value = true
	}

	if (!moShi.value) {
		isValid = false
	}

	return isValid
}

const jiSuanXuQiu = () => {
	if (!yanZhengShuRu()) {
		yiJiSuan.value = false
		store.yiJiSuan = false
		return
	}

	let tanShuiMeiKg, danBaiMeiKg, zhiFangMeiKg

	if (moShi.value === 'jianZhi') {
		tanShuiMeiKg = JIANZHI_TANSHUI_MEI_KG
		danBaiMeiKg = JIANZHI_DANBAI_MEI_KG
		zhiFangMeiKg = JIANZHI_ZHIFANG_MEI_KG
	} else {
		tanShuiMeiKg = ZENGJI_TANSHUI_MEI_KG
		danBaiMeiKg = ZENGJI_DANBAI_MEI_KG
		zhiFangMeiKg = ZENGJI_ZHIFANG_MEI_KG
	}

	tanShui.value = tiZhong.value * tanShuiMeiKg
	danBai.value = tiZhong.value * danBaiMeiKg
	zhiFang.value = tiZhong.value * zhiFangMeiKg

	zongReLiang.value =
		tanShui.value * RELIANG_MEI_KE_TANSHUI +
		danBai.value * RELIANG_MEI_KE_DANBAI +
		zhiFang.value * RELIANG_MEI_KE_ZHIFANG

	yiJiSuan.value = true

	store.niCheng = niCheng.value
	store.tiZhong = tiZhong.value
	store.moShi = moShi.value
	store.tanShui = tanShui.value
	store.danBai = danBai.value
	store.zhiFang = zhiFang.value
	store.zongReLiang = zongReLiang.value
	store.yiJiSuan = yiJiSuan.value
}

const jiSuanBingBaoCun = () => {
	jiSuanXuQiu()
	if (yiJiSuan.value) {
		localStorage.setItem('yongHuNiCheng', niCheng.value)
		localStorage.setItem('yongHuTiZhong', tiZhong.value.toString())
		localStorage.setItem('yongHuMoShi', moShi.value)
		router.push('/detail')
	}
}

onMounted(() => {
	nextTick(() => {
		const cunChuNiCheng = localStorage.getItem('yongHuNiCheng')
		const cunChuTiZhong = localStorage.getItem('yongHuTiZhong')
		const cunChuMoShi = localStorage.getItem('yongHuMoShi')

		if (cunChuNiCheng && cunChuTiZhong && cunChuMoShi) {
			niCheng.value = cunChuNiCheng
			store.niCheng = cunChuNiCheng
			moShi.value = cunChuMoShi
			store.moShi = cunChuMoShi
			const jieXiTiZhong = parseFloat(cunChuTiZhong)
			if (!isNaN(jieXiTiZhong) && jieXiTiZhong > 0) {
				tiZhong.value = jieXiTiZhong
				store.tiZhong = jieXiTiZhong
				validationAttempted.value = false
				jiSuanXuQiu()
				if (yiJiSuan.value) {
					router.push('/detail')
				}
			} else {
				localStorage.removeItem('yongHuTiZhong')
				localStorage.removeItem('yongHuMoShi')
				moShi.value = 'jianZhi'
				store.moShi = 'jianZhi'
				validationAttempted.value = false
			}
		} else {
			if (cunChuNiCheng) {
				niCheng.value = cunChuNiCheng
				store.niCheng = cunChuNiCheng
			}
			moShi.value = 'jianZhi'
			store.moShi = 'jianZhi'
			validationAttempted.value = false
		}
	})
})
</script>

<style lang="scss" scoped>
@use 'sass:color';

$primary-color: #007bff;
$secondary-color: #6c757d;
$danger-color: #d9534f;
$light-color: #f9f9f9;
$border-color: #ccc;
$text-color-primary: #333;
$text-color-secondary: #555;
$text-color-muted: #777;
$text-color-light: white;
$text-color-active: $primary-color;
$active-bg-color: #eef5ff;

$base-font-size: 40px;
$large-font-size: 70px;
$medium-font-size: 48px;
$results-font-size: 36px;
$tips-font-size: 26px;

$base-padding: 25px;
$container-padding: 60px;
$form-h-padding: 50px;
$results-padding: 40px;
$button-v-padding: 20px;
$button-h-padding: 40px;

$border-radius: 12px;
$results-border-radius: 20px;
$chart-item-border-radius: 8px;

$input-section-gap: 30px;
$input-label-width: 100px;

$transition-speed: 0.3s;
$transition-ease: ease;

.nutrition-calculator {
	width: 100vw;
	margin: 0 auto;
	padding: $container-padding;
	box-sizing: border-box;
	background-image: url('@/assets/banner.jpeg');
	background-size: contain;
	background-repeat: no-repeat;
}

h1 {
	text-align: center;
	color: $text-color-primary;
	margin: 150px 0 80px;
	font-size: $large-font-size;
	font-weight: 700;
}

.form {
	padding: 0 $form-h-padding;
	margin-top: 260px;

	.input-section .calculate-button {
		margin-top: 80px;
	}
}

.input-section {
	display: flex;
	align-items: center;
	gap: $input-section-gap;
	margin-bottom: 30px;

	label {
		flex: 0 0 $input-label-width;
		font-weight: bold;
		font-size: $base-font-size;
		color: $text-color-secondary;
	}

	input[type='number'],
	input[type='text'] {
		flex: 1;
		padding: $base-padding;
		border: 2px solid $border-color;
		border-radius: $border-radius;
		font-size: $base-font-size;
		text-align: center;
		box-sizing: border-box;
		transition: border-color $transition-speed $transition-ease;
		color: $text-color-primary;

		&[type='number'] {
			&::-webkit-outer-spin-button,
			&::-webkit-inner-spin-button {
				-webkit-appearance: none;
				margin: 0;
			}
		}

		&.invalid-input {
			border-color: $danger-color;
			&::placeholder {
				color: $danger-color;
				opacity: 0.7;
			}
		}

		&:focus {
			outline: none;
			border-color: $primary-color;
			box-shadow: 0 0 0 2px rgba($primary-color, 0.2);
		}
	}

	&.mode-selection {
		.mode-buttons {
			flex: 1;
			display: flex;
			gap: 20px;
			justify-content: center;
			flex-wrap: nowrap;

			.button {
				flex: 1;
				padding: $button-v-padding $button-h-padding;
				font-size: $results-font-size;
				border: 2px solid $border-color;
				color: $text-color-secondary;
				border-radius: $border-radius;
				cursor: pointer;
				transition: background-color $transition-speed $transition-ease,
					border-color $transition-speed $transition-ease,
					color $transition-speed $transition-ease;
				text-align: center;

				&.active {
					background-color: $active-bg-color;
					color: $text-color-active;
					border-color: $primary-color;
					font-weight: bold;
				}

				&:hover:not(.active) {
					background-color: color.adjust($active-bg-color, $lightness: -3%);
					border-color: color.adjust($border-color, $lightness: -10%);
				}
				&:active {
					transform: scale(0.98);
				}
			}
		}
	}

	button {
		flex: 1;
		padding: $base-padding $button-h-padding;
		border: none;
		border-radius: $border-radius;
		font-size: $base-font-size;
		cursor: pointer;
		transition: background-color $transition-speed $transition-ease,
			transform $transition-speed * 0.5 $transition-ease;
		box-sizing: border-box;
		font-weight: 700;

		&:active {
			transform: scale(0.98);
		}
	}

	.calculate-button {
		background-color: $primary-color;
		color: $text-color-light;

		&:hover {
			background-color: color.adjust($primary-color, $lightness: -10%);
		}
	}
}
</style>
