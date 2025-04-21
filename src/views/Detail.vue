<template>
	<div
		class="nutrition-calculatored"
		ref="captureTarget">
		<span class="date">{{ nowDate }}</span>
		<h1>{{ niCheng }}</h1>
		<div
			ref="tuBiaoRongQi"
			class="chart-container"
			v-show="yiJiSuan"></div>
		<div class="results-section">
			<h2>每餐建议摄入量 ({{ moShi === 'jianZhi' ? '减脂' : '增肌' }}模式)</h2>
			<div class="results-text">
				<p>
					碳水化合物<span>{{ tanShui.toFixed() }}克</span>
				</p>
				<p>
					蛋白质<span>{{ danBai.toFixed() }}克</span>
				</p>
				<p>
					脂肪<span>{{ zhiFang.toFixed() }}克</span>
				</p>
				<p class="total-calories">
					每餐总热量<span>{{ zongReLiang.toFixed() }}大卡</span>
				</p>
			</div>
			<div class="tips">
				<p>注意：</p>
				<ul>
					<li v-if="moShi === 'jianZhi'">
						减脂模式: 每餐按 碳水化合物 1g/kg, 蛋白质 0.6g/kg,
						脂肪0.4g/kg体重计算。
					</li>
					<li v-if="moShi === 'zengJi'">
						增肌模式: 每餐按 碳水化合物 2g/kg, 蛋白质 0.6g/kg,
						脂肪0.4g/kg体重计算。
					</li>
					<li>
						热量基于: 碳水化合物(4大卡/克), 蛋白质(4大卡/克), 脂肪(9大卡/克)。
					</li>
					<li>
						请根据个人全天总摄入目标、训练强度、消化吸收能力和健康状况咨询专业人士调整。
					</li>
				</ul>
			</div>
		</div>
	</div>
	<div class="input-section">
		<button
			@click="chongZhiJiSuan"
			class="reset-button">
			重新计算
		</button>

		<button
			@click="saveToAlbum"
			class="reset-button save-button">
			保存结果图
		</button>
	</div>
</template>

<script setup>
import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts/core'
import { PieChart } from 'echarts/charts'
import {
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { store } from '../store'
import html2canvas from 'html2canvas'

echarts.use([
	TitleComponent,
	TooltipComponent,
	LegendComponent,
	GridComponent,
	PieChart,
	CanvasRenderer
])

const router = useRouter()

const nowDate = new Date().toLocaleString().split(' ')[0].replaceAll('/', '-')

const niCheng = ref(store.niCheng)
const moShi = ref(store.moShi)
const tanShui = ref(store.tanShui)
const tiZhong = ref(store.tiZhong)
const danBai = ref(store.danBai)
const zhiFang = ref(store.zhiFang)
const zongReLiang = ref(store.zongReLiang)
const yiJiSuan = ref(store.yiJiSuan)
const tuBiaoRongQi = ref(null)
const captureTarget = ref(null)
let myChart = null

let resizeObserver = null
let resizeTimer = null

const debounceResize = () => {
	if (resizeTimer) clearTimeout(resizeTimer)
	resizeTimer = setTimeout(() => {
		if (myChart) {
			myChart.resize()
		}
	}, 150)
}

const chuShiHuaTuBiao = () => {
	if (tuBiaoRongQi.value && !myChart) {
		myChart = echarts.init(tuBiaoRongQi.value)
		myChart.setOption({
			title: {
				text: `体重${tiZhong.value}kg`,
				left: 'center',
				top: 'center',
				textStyle: {
					fontSize: 20,
					fontWeight: 'bold',
					color: '#333'
				}
			},
			tooltip: {
				trigger: 'item',
				formatter: '{b}: {c}g ({d}%)',
				textStyle: { fontSize: 14 }
			},
			legend: {
				show: false
			},
			series: [
				{
					name: '每餐营养素分布',
					type: 'pie',
					radius: ['50%', '70%'],
					center: ['50%', '50%'],
					avoidLabelOverlap: true,
					itemStyle: {
						borderRadius: 8
					},
					label: {
						show: true,
						position: 'outside',
						formatter: '{b}: {c}g',
						fontSize: 14,
						fontWeight: 700,
						color: '#333'
					},
					labelLine: {
						show: true,
						length: 10,
						length2: 15,
						smooth: false
					},
					emphasis: {
						label: { show: true }
					},
					data: []
				}
			]
		})

		if (ResizeObserver) {
			resizeObserver = new ResizeObserver(debounceResize)
			resizeObserver.observe(tuBiaoRongQi.value)
		} else {
			window.addEventListener('resize', debounceResize)
		}
	}
}

const gengXinTuBiao = () => {
	if (!myChart) return

	myChart.setOption(
		{
			series: [
				{
					data: [
						{ value: parseFloat(tanShui.value.toFixed()), name: '碳水' },
						{ value: parseFloat(danBai.value.toFixed()), name: '蛋白' },
						{ value: parseFloat(zhiFang.value.toFixed()), name: '脂肪' }
					]
				}
			]
		},
		false
	)
}

const chongZhiJiSuan = () => {
	localStorage.removeItem('yongHuNiCheng')
	localStorage.removeItem('yongHuTiZhong')
	localStorage.removeItem('yongHuMoShi')

	store.niCheng = ''
	store.tiZhong = null
	store.moShi = 'jianZhi'
	store.tanShui = 0
	store.danBai = 0
	store.zhiFang = 0
	store.zongReLiang = 0
	store.yiJiSuan = false

	niCheng.value = ''
	tiZhong.value = null
	moShi.value = 'jianZhi'
	tanShui.value = 0
	danBai.value = 0
	zhiFang.value = 0
	zongReLiang.value = 0
	yiJiSuan.value = false

	if (myChart) {
		myChart.dispose()
		myChart = null
	}

	router.push('/')
}

const saveToAlbum = async event => {
	if (!captureTarget.value) {
		console.error('Target element for capture not found.')
		alert('无法找到需要截图的区域，请稍后再试。')
		return
	}

	const button = event.target
	if (button) button.disabled = true
	if (button) button.textContent = '正在生成...'

	try {
		await nextTick()

		const canvas = await html2canvas(captureTarget.value, {
			useCORS: true,
			allowTaint: true,
			scale: window.devicePixelRatio > 1 ? 2 : 1,
			backgroundColor: '#ffffff',
			logging: false,
			onclone: clonedDoc => {
				const clonedChartContainer = clonedDoc.querySelector('.chart-container')
				if (
					clonedChartContainer &&
					clonedChartContainer.style.display === 'none'
				) {
					clonedChartContainer.style.display = 'block'
				}
				const clonedTarget = clonedDoc.querySelector('.nutrition-calculatored')
				if (clonedTarget) {
					clonedTarget.style.marginTop = '0'
					clonedTarget.style.padding = '20px'
				}
			}
		})

		const imageDataUrl = canvas.toDataURL('image/png')

		const link = document.createElement('a')
		link.href = imageDataUrl

		const safeNiCheng = (niCheng.value || '结果').replace(/[/\\?%*:|"<>]/g, '-')
		link.download = `营养计算结果-${safeNiCheng}-${nowDate}.png`

		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)

		console.log('Image download initiated.')
	} catch (error) {
		console.error('Error capturing element with html2canvas:', error)
		alert('生成截图失败，请稍后重试或检查控制台错误信息。')
	} finally {
		if (button) button.disabled = false
		if (button) button.textContent = '保存结果图'
	}
}

onMounted(() => {
	nextTick(() => {
		if (yiJiSuan.value) {
			if (tiZhong.value !== null && tiZhong.value !== undefined) {
				chuShiHuaTuBiao()
				gengXinTuBiao()
			} else {
				console.error('体重数据无效，无法初始化图表中心文字。')
			}
		}
	})
})

onBeforeUnmount(() => {
	if (resizeTimer) clearTimeout(resizeTimer)
	if (resizeObserver && tuBiaoRongQi.value) {
		resizeObserver.unobserve(tuBiaoRongQi.value)
		resizeObserver.disconnect()
	} else {
		window.removeEventListener('resize', debounceResize)
	}
	if (myChart) {
		myChart.dispose()
		myChart = null
	}
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

.nutrition-calculatored {
	width: 100vw;
	margin: 0 auto;
	box-sizing: border-box;
	position: relative;

	.date {
		position: absolute;
		top: 0;
		right: 20px;
		color: $text-color-muted;
		font-size: 34px;
	}
}

h1 {
	text-align: center;
	color: $text-color-primary;
	margin: 50px 0 20px;
	font-size: $large-font-size;
	font-weight: 700;
}

h2 {
	text-align: center;
	color: $text-color-primary;
	font-weight: 700;
}

.chart-container {
	width: 100%;
	height: 560px;
	margin: 30px auto;
}

.results-section {
	padding: $results-padding;
	background-color: $light-color;
	border-radius: $results-border-radius;
	box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
	margin: 30px $container-padding 0;

	h2 {
		color: $text-color-primary;
		margin-bottom: 40px;
		font-size: $medium-font-size;
		margin-top: 0;
	}

	.results-text {
		p {
			margin: 20px 0;
			font-size: $results-font-size;
			color: $text-color-secondary;
			display: flex;
			justify-content: space-between;
			padding: 0 25px;
			flex-wrap: wrap;
			font-weight: bold;

			span {
				font-weight: bold;
				color: $text-color-primary;
				margin-left: 10px;
			}

			&.total-calories {
				margin-top: 35px;
				font-size: $base-font-size !important;
				font-weight: bold;
				color: $danger-color !important;

				span {
					color: $danger-color !important;
				}
			}
		}
	}

	.tips {
		margin-top: 30px;
		font-size: $tips-font-size;
		color: $text-color-muted;
		line-height: 1.7;

		p {
			font-size: inherit;
			color: inherit;
			line-height: inherit;
			margin: 0 0 10px 0;
			text-align: left;

			&:first-child {
				font-weight: bold;
				color: $text-color-secondary;
			}
		}
		ul {
			list-style: disc;
			padding-left: 40px;
			margin: 10px 0 0 0;
		}
		li {
			font-size: 28px;
			color: inherit;
			line-height: 1.5;
			margin-bottom: 10px;
			text-align: justify;
		}
	}
}

.input-section {
	display: flex;
	align-items: center;
	gap: $input-section-gap;
	margin: 30px $container-padding 0;
}

.input-section .reset-button {
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

	background-color: $active-bg-color;
	color: $primary-color;
	border: 2px solid $primary-color;

	&:hover {
		background-color: color.adjust($active-bg-color, $lightness: -5%);
		border-color: color.adjust($primary-color, $lightness: -10%);
	}

	&:active {
		transform: scale(0.98);
	}
}

.input-section .reset-button:disabled {
	cursor: not-allowed;
	opacity: 0.6;
	background-color: #e9ecef;
	border-color: #ced4da;
	color: #6c757d;
}

.input-section .reset-button.save-button {
	background-color: $primary-color;
	color: #ffffff;
}
</style>
