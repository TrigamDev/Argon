import { useWavesurfer } from "@wavesurfer/react"
import { useCallback, useEffect, useRef, useState } from "react"
import moment from "moment";

import "./Visualizer.css";

export default function Visualizer({ post, bars, setTime }: { post: any, bars: boolean, setTime: CallableFunction }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [loop, setLoop] = useState(false);
    const [totalTime, setTotalTime] = useState(0);
    const [volume, setVolume] = useState(50);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        localStorage.getItem('volume') && setVolume(Number(localStorage.getItem('volume')));
        localStorage.getItem('muted') && setMuted(localStorage.getItem('muted') === 'true');
    }, []);

    var style = getComputedStyle(document.body);

    const { wavesurfer, isPlaying, currentTime } = useWavesurfer({
        container: containerRef,
        height: 150,
        waveColor: style.getPropertyValue('--secondary-dark'),
        progressColor: style.getPropertyValue('--accent-light'),
        cursorColor: style.getPropertyValue('--accent-light'),
        url: post?.file?.url,
        normalize: true,
        barWidth: bars ? 2 : 0
    });

    const onPlayPause = useCallback(() => {
        wavesurfer && wavesurfer.playPause();
    }, [wavesurfer]);

    wavesurfer?.on('ready', () => {
        setTotalTime(wavesurfer?.getDuration());
        setTime(wavesurfer?.getDuration());
    });

    wavesurfer?.on('finish', () => {
        if (loop) wavesurfer?.play();
        else wavesurfer?.stop();
    })

    const currentDuration = moment.duration(currentTime, "s");
    const currentLabel = [
        currentDuration.minutes(),
        currentDuration.seconds()
    ].map(v => v.toString().padStart(2, '0')).join(':');

    const totalDuration = moment.duration(totalTime, "s");
    const totalLabel = [
        totalDuration.minutes(),
        totalDuration.seconds()
    ].map(v => v.toString().padStart(2, '0')).join(':');

    useEffect(() => {
        wavesurfer?.setVolume(volume / 100);
        wavesurfer?.setMuted(muted);

        localStorage.setItem('volume', volume.toString());
        localStorage.setItem('muted', muted.toString());
    }, [volume, muted]);

    return (
        <div className="post-audio">
            <div className="visuals">
                <img src={post?.file?.musicCoverUrl ?? '/default_music.png'} alt="Thumbnail" className="audio-img"/>
                <div className="post-visualizer" ref={containerRef}>
                </div>
            </div>
            <div className="post-visualizer-time">
                <span className="post-visualizer-time-current">{currentLabel}</span>/
                <span className="post-visualizer-time-total">{totalLabel}</span>
            </div>
            <div className="post-visualizer-controls">
                <div className="volume-controls">
                    { !muted && <button id="audio-mute" className="audio-button" onClick={() => { setMuted(true); }}><img src="/icons/volume_loud.svg"/></button> }
                    { muted && <button id="audio-unmute" className="audio-button" onClick={() => { setMuted(false); }}><img src="/icons/volume_muted.svg"/></button> }
                    <input type="range" id="audio-volume" className={"audio-slider " + (muted ? 'muted' : '')} min="0" max="100" disabled={muted} value={volume} onChange={(e) => { setVolume(Number(e.target.value)) }}/>
                </div>
                <div className="track-controls">
                    <button id="audio-back" className="audio-button" onClick={() => wavesurfer?.skip(-5)}><img src="/icons/fast_forward.svg"/></button>
                    <button id="audio-stop" className="audio-button" onClick={() => { wavesurfer?.stop() }}><img src="/icons/stop.svg"/></button>
                    { !isPlaying && <button id="audio-play" className="audio-button" onClick={onPlayPause}><img src="/icons/play.svg"/></button> }
                    { isPlaying && <button id="audio-pause" className="audio-button" onClick={onPlayPause}><img src="/icons/pause.svg"/></button> }
                    { loop && <button id="audio-loop" className="audio-button" onClick={() => setLoop(false)}><img src="/icons/loop.svg"/></button> }
                    { !loop && <button id="audio-unloop" className="audio-button" onClick={() => setLoop(true)}><img src="/icons/loop_off.svg"/></button> }
                    <button id="audio-forward" className="audio-button" onClick={() => wavesurfer?.skip(5)}><img src="/icons/fast_forward.svg"/></button>
                </div>
                <div id="spacer"/>
            </div>
        </div>
    )
}