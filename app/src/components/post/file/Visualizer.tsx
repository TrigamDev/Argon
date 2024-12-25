import { useCallback, useEffect, useRef } from "react"
import { useStore } from "@nanostores/react"

import { useWavesurfer } from "@wavesurfer/react"
import moment from "moment"

import { playing, duration, volume, muted, loop } from "@argon/stores/file"

import "@argon/components/post/file/visualizer.css"

export default function Visualizer({ post, bars }: { post: any, bars: boolean }) {
	const containerRef = useRef<HTMLDivElement>(null)

	const $playing = useStore(playing)
	const $duration = useStore(duration)
	const $volume = useStore(volume)
	const $muted = useStore(muted)
	const $loop = useStore(loop)

	// Create waveform
	var style = window.getComputedStyle(document.body)
	const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
		container: containerRef,
		height: 150,
		waveColor: style.getPropertyValue('--secondary'),
		progressColor: style.getPropertyValue('--accent'),
		cursorColor: style.getPropertyValue('--accent'),
		url: post?.file?.url,
		normalize: true,
		barWidth: bars ? 4 : 0
	})


	// Load settings from local storage
	useEffect(() => {
		localStorage.getItem('volume') && volume.set(Number(localStorage.getItem('volume')))
		localStorage.getItem('muted') && muted.set(localStorage.getItem('muted') === 'true')
	}, [])

	// Apply settings on change
	useEffect(() => {
		wavesurfer?.setVolume($volume / 100)
		wavesurfer?.setMuted($muted)

		localStorage.setItem('volume', $volume.toString())
		localStorage.setItem('muted', $muted.toString())
	}, [$volume, $muted])

	// Load data on ready
	wavesurfer?.on('ready', () => {
		duration.set(wavesurfer?.getDuration())
	})

	// Play/Pause
	const onPlayPause = useCallback(() => {
		if (wavesurfer) {
			wavesurfer.playPause()
			playing.set(wavesurfer.isPlaying())
		}
	}, [wavesurfer])

	// Loop on finish
	wavesurfer?.on('finish', () => {
		if ($loop) wavesurfer?.play()
		else wavesurfer?.stop()
	})

	// Get current time
	const currentDuration = moment.duration(currentTime, "s")
	const currentLabel = [
		currentDuration.minutes(),
		currentDuration.seconds()
	].map(v => v.toString().padStart(2, '0')).join(':')

	// Get total duration
	const totalDuration = moment.duration($duration, "s")
	const totalLabel = [
		totalDuration.minutes(),
		totalDuration.seconds()
	].map(v => v.toString().padStart(2, '0')).join(':')

	return (
		<div className="post-audio">
			{ /* Thumbnail and Waveform */ }
			<div className="visuals">
				<img src={post?.file?.thumbnailUrl} alt="Thumbnail" className="audio-img"/>
				<div className="post-visualizer" ref={containerRef} />
			</div>

			{ /* Time and Duration Labels */ }
			<div className={"post-visualizer-time" + ($playing ? '' : ' paused')}>
				<span className="post-visualizer-time-current">{currentLabel}</span>/
				<span className="post-visualizer-time-total">{totalLabel}</span>
			</div>

			<div className="post-visualizer-controls">
				{ /* Track Controls */ }
				<div className="track-controls">
					<button id="audio-back" className="audio-button" onClick={() => wavesurfer?.skip(-5)}><img src="/icons/audio/fast_forward.svg" alt="Skip Backward"/></button>
					<button id="audio-stop" className="audio-button" onClick={() => { wavesurfer?.stop() }}><img src="/icons/audio/stop.svg" alt="Stop"/></button>
					{ !isPlaying && <button id="audio-play" className="audio-button" onClick={onPlayPause}><img src="/icons/audio/play.svg" alt="Play"/></button> }
					{ isPlaying && <button id="audio-pause" className="audio-button" onClick={onPlayPause}><img src="/icons/audio/pause.svg" alt="Pause"/></button> }
					{ $loop && <button id="audio-loop" className="audio-button" onClick={() => loop.set(false)}><img src="/icons/audio/loop.svg" alt="Disable Looping"/></button> }
					{ !$loop && <button id="audio-unloop" className="audio-button" onClick={() => loop.set(true)}><img src="/icons/audio/loop_off.svg" alt="Enable Looping"/></button> }
					<button id="audio-forward" className="audio-button" onClick={() => wavesurfer?.skip(5)}><img src="/icons/audio/fast_forward.svg" alt="Skip Forward"/></button>
				</div>

				{ /* Volume Controls */ }
				<div className="volume-controls">
					{ !$muted && <button id="audio-mute" className="audio-button" onClick={() => { muted.set(true) }}><img src="/icons/audio/volume_loud.svg" alt="Mute"/></button> }
					{ $muted && <button id="audio-unmute" className="audio-button" onClick={() => { muted.set(false) }}><img src="/icons/audio/volume_muted.svg" alt="Unmute"/></button> }
					<input type="range" id="audio-volume" className={"audio-slider " + ($muted ? 'muted' : '')} min="0" max="100" disabled={$muted} value={$volume} onChange={(e) => { volume.set(Number(e.target.value)) }}/>
				</div>
				<div id="spacer"/>
			</div>
		</div>
	)
}