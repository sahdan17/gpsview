<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import logo from '@/assets/images/logo.png'
import { ref, onMounted } from 'vue'

const sidebar = ref<HTMLElement | null>(null)
const isShrink = ref(false)

const toggleSidebar = () => {
	if (sidebar.value) {
		sidebar.value.classList.toggle('shrink')
	}
}

onMounted(() => {
	const toggleBtn = document.getElementById("toggleBtn")
	if (toggleBtn) {
		toggleBtn.addEventListener("click", toggleSidebar)
	}

	document.querySelectorAll(".navIcon").forEach(icon => {
		icon.addEventListener("click", () => {
			if (sidebar.value && sidebar.value.classList.contains("shrink")) {
				sidebar.value.classList.remove("shrink")
			}
		})
	})
})
</script>

<template>
	<nav id="sidebar" ref="sidebar" class="container">
		<div class="menuBtn" id="toggleBtn">
			<font-awesome-icon :icon="['fas', 'bars']" class="toggleSidebar" id="open" />
			<font-awesome-icon :icon="['fas', 'xmark']" class="toggleSidebar" id="close" />
		</div>
		<div id="logoContainer">
			<img :src="logo" alt="Logo" id="logo" />
		</div>
			<ul>
				<li class="active nav-item toggleSidebar">
					<RouterLink to="#">
						<span class="navRow">
							<span class="navIcon toggleSidebar">
								<font-awesome-icon :icon="['fas', 'location-dot']" />
							</span>
							<span class="navText">Monitoring</span>
							<span class="dropBtn">
								<font-awesome-icon :icon="['fas', 'chevron-down']" id="btnDown" />
								<font-awesome-icon :icon="['fas', 'chevron-up']" id="btnUp" />
							</span>
						</span>
						<ul class="hideNav">
							<li>
								<RouterLink class="navLink" to="/dashboard">
									<span>Live Monitoring</span>
								</RouterLink>
							</li>
							<li>
								<RouterLink class="navLink" to="/history">
									<span>History</span>
								</RouterLink>
							</li>
						</ul>
					</RouterLink>                
				</li>
				<li class="nav-item toggleSidebar">
					<RouterLink class="navLink" to="route">
						<span class="navRow">
							<span class="navIcon toggleSidebar">
								<font-awesome-icon :icon="['fas', 'map-location-dot']" />
							</span>
								<span class="navText">Route Zone</span>
								<span class="dropBtn" id="hide">
								<font-awesome-icon :icon="['fas', 'chevron-down']" id="btnDown" />
								<font-awesome-icon :icon="['fas', 'chevron-up']" id="btnUp" />
							</span>
						</span>
					</RouterLink>
				</li>
			</ul>
		<div class="logout">
			<font-awesome-icon :icon="['fas', 'right-from-bracket']" />
		</div>
	</nav>    
	<main id="content">
		<RouterView />
	</main >
</template>

<style scoped>
* {
  	font-family: "Exo 2", serif;
}

body {
	margin: 0;
	padding: 0;
}

#sidebar {
	border: 3px solid rgba(18, 51, 110, .6);
	width: 300px;
	border-radius: 25px;
	background-color: rgba(18, 51, 115, .8);
	height: 97vh;
	position: fixed;
	top: 0;
	display: flex;
	flex-flow: column;
	transition: width .5s ease, height .5s ease;
	overflow: hidden;
	box-shadow: 5px 10px 30px rgba(0, 0, 0, 1);
	backdrop-filter: blur(10px);
	margin-top: 1vh;
	margin-left: 1vh;
	z-index: 3;
}

#sidebar.shrink {
	width: 80px;
	height: 285px;
}

#sidebar.shrink .navText {
  	display: none;
}

#sidebar.shrink .dropBtn {
  	display: none;
}

#sidebar.shrink .hideNav {
  	display: none;
}

ul {
	list-style: none;
	padding-block: 20px;
	padding-inline: 20px;
	margin: 0;
	font-size: 18px;
}

li {
  	padding-bottom: 10px;
}

li.active a {
	color: #c91414;
	font-weight: 600;
}

li a {
	text-decoration: none;
	align-items: center;
	gap: 15px;
	color: white;
	justify-content: space-between;
}

li a:hover {
  	color: #adaaaa;
}

.navIcon {
	font-size: 30px;
	width: 30px;
	text-align: center;
}

.navRow {
	display: flex;
	align-items: center;
	gap: 15px;
	justify-content: space-between;
	width: 100%;
}

#logo {
  	width: 50%;
}

#logoContainer {
  	text-align: center;
}

.dropBtn {
	margin-left: auto;
	cursor: pointer;
}

li:hover .hideNav {
  	display: block;
}

.hideNav li a {
	color: white;
	text-decoration: none;
	display: block;
}

.hideNav li a:hover {
  	color: #adaaaa;
}

.hideNav {
	display: none;
	padding-left: 50px;
	padding-top: 10px;
	padding-bottom: 0px;
}

.dropBtn #btnUp {
  	display: none;
}

li:hover .dropBtn #btnDown {
  	display: none;
}

li:hover #btnUp {
  	display: inline-block;
}

.menuBtn {
	margin-left: auto;
	margin-right: 27px;
	cursor: pointer;
	color: white;
	font-size: 30px;
	padding-top: 20px;
	padding-bottom: 10px;
}

.menuBtn #open {
  	display: none;
}

#sidebar.shrink .menuBtn #open {
  	display: inline-block;
}

#sidebar.shrink .menuBtn #close {
  	display: none;
}

.logout {
	margin-top: auto;
	margin-left: auto;
	margin-right: 25px;
	margin-bottom: 30px;
	color: white;
	font-size: 30px;
	cursor: pointer;
}

#hide {
  	opacity: 0;
}

#content {
	padding-left: 335px;
	transition: padding-left .25s ease-in-out;
	overflow-x: hidden;
	word-wrap: break-word;
}

#sidebar.shrink + #content {
  	padding-left: 115px;
}

@media (max-width: 500px) {
	#sidebar.shrink {
		height: 75px;
		width: 80px;
	}

	#sidebar.shrink .navIcon {
		display: none;
	}

	#sidebar.shrink .logout {
		display: none;
	}

	#sidebar.shrink #logoContainer {
		display: none;
	}
}
</style>
