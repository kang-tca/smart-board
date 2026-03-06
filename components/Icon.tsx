
import React from 'react';

interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = "w-6 h-6" }) => {
  const icons: { [key: string]: React.ReactElement } = {
    // =================================================================
    // [수정됨] Google 아이콘 추가
    // =================================================================
    'google': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
      </svg>
    ),
    'coffee': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 2.25h2.998a2.25 2.25 0 0 1 2.25 2.25v6.002a2.25 2.25 0 0 1-2.25 2.248H10.5a2.25 2.25 0 0 1-2.25-2.248V4.5a2.25 2.25 0 0 1 2.25-2.25Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 4.5h1.5A2.25 2.25 0 0 1 20.25 6.75v.75a2.25 2.25 0 0 1-2.25 2.25h-1.5V4.5Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 13.5h13.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 13.5v2.25A5.25 5.25 0 0 0 12 21v0a5.25 5.25 0 0 0 5.25-5.25V13.5" />
      </svg>
    ),
    'raffle': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002" />
      </svg>
    ),
    'settings': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" xmlSpace="preserve" className={className}><path fill="currentColor" d="M100.932 123.348c-12.1 0-21.9-9.8-21.9-21.9s9.8-22 21.9-22 21.9 9.9 21.9 22-9.8 21.9-21.9 21.9zm0-40c-10 0-18.1 8.1-18.1 18.1s8.1 18 18.1 18 18-8.1 18-18-8.1-18.1-18-18.1z"/><path fill="currentColor" d="M90.232 147.248h-.4c-7-1.6-13.6-4.8-19.3-9.3-.4-.3-.7-.8-.7-1.3s.1-1 .4-1.5l2.7-3.4c-3.7-3.2-6.8-7.1-9.1-11.4l-4 1.9c-1 .5-2.2.1-2.7-.9-3.1-6.5-4.7-13.5-4.7-20.8 0-.5.2-1 .6-1.4.4-.4.9-.6 1.4-.6h4.4c.2-4.9 1.3-9.7 3.3-14.3l-4-1.9c-.5-.2-.8-.6-1-1.1-.2-.5-.1-1 .1-1.5 3-6.5 7.6-12.3 13.2-16.8.8-.7 2.1-.6 2.8.3l2.8 3.4c4-2.9 8.4-5 13.2-6.4l-1-4.3c-.1-.5 0-1.1.3-1.5.3-.4.7-.8 1.2-.9 6.9-1.6 14.4-1.6 21.3-.1 1.1.2 1.7 1.3 1.5 2.4l-1 4.3c4.7 1.3 9.2 3.5 13.2 6.3l2.7-3.4c.3-.4.8-.7 1.3-.7.5-.1 1 .1 1.5.4 5.6 4.5 10.2 10.3 13.3 16.7.2.5.3 1 .1 1.5-.2.5-.5.9-1 1.1l-4 1.9c2 4.6 3.1 9.4 3.3 14.3l4.3-.1c.5 0 1 .2 1.4.6.4.4.6.9.6 1.4 0 7.5-1.6 14.5-4.7 21-.2.5-.6.8-1.1 1s-1 .1-1.5-.1l-4-1.9c-2.3 4.3-5.4 8.2-9.1 11.5l2.7 3.4c.7.9.5 2.1-.3 2.8-5.6 4.5-12.3 7.7-19.2 9.3-1.1.3-2.1-.4-2.4-1.5l-1-4.3c-4.9.9-9.7.9-14.6 0l-1 4.3c-.1.5-.4 1-.9 1.2-.2.3-.5.4-.9.4zm-15.6-11.2c4.3 3.1 9.1 5.4 14.1 6.8l.9-4.2c.1-.5.4-1 .9-1.2.4-.3 1-.4 1.5-.3 5.6 1.3 11.1 1.3 16.8 0 .5-.1 1.1 0 1.5.3s.8.7.9 1.2l1 4.2c5.1-1.4 9.9-3.7 14.1-6.8l-2.7-3.4c-.7-.9-.5-2.1.3-2.8 4.4-3.5 8-8 10.4-13.1.5-1 1.7-1.4 2.7-.9l3.9 1.9c2.1-4.9 3.3-10.1 3.5-15.4l-4.3.1c-.5 0-1-.2-1.4-.6-.4-.4-.6-.9-.6-1.4 0-5.7-1.3-11.2-3.8-16.4-.5-1-.1-2.2.9-2.7l3.9-1.9c-2.5-4.6-5.9-8.8-9.8-12.2l-2.7 3.4c-.7.9-1.9 1-2.8.3-4.5-3.5-9.6-6-15.1-7.2-1.1-.2-1.7-1.3-1.5-2.4l.9-4.2c-5.1-1-10.6-1-15.7 0l1 4.2c.1.5 0 1.1-.3 1.5-.3.4-.7.8-1.2.9-5.5 1.2-10.7 3.7-15.1 7.3-.9.7-2.1.6-2.8-.3l-2.7-3.3c-3.9 3.5-7.3 7.7-9.8 12.3l3.9 1.9c1 .5 1.4 1.7.9 2.6-2.5 5.2-3.7 10.6-3.7 16.3 0 1.1-.9 2.1-2 2.1l-4.2-.2c.2 5.3 1.4 10.4 3.5 15.3l3.9-1.9c.5-.2 1-.3 1.5-.1s.9.5 1.1 1c2.5 5.1 6.1 9.6 10.5 13.1.4.3.7.8.7 1.3s-.1 1-.4 1.5l-2.6 3.4z"/></svg>
    ),
    'sticker': (
       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}>
         <circle cx="24" cy="24" r="23" style={{fill: '#ffce52'}} />
         <ellipse cx="33" cy="18" rx="3" ry="4" style={{fill: '#273941'}} />
         <ellipse cx="15" cy="18" rx="3" ry="4" style={{fill: '#273941'}} />
         <path style={{fill: '#273941'}} d="M24 39c-7.72 0-14-5.832-14-13h2c0 6.065 5.383 11 12 11s12-4.935 12-11h2c0 7.168-6.28 13-14 13z" />
       </svg>
    ),
    'sticker-like': (
      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0" y="0" viewBox="0 0 512 512" xmlSpace="preserve" className={className}><style>{`.st1{fill:#edf3fc}.st3{fill:#ffbe1b}.st10{fill:#5d8ef9}`}</style><path className="st1" d="M255.999 40.928c-118.778 0-215.071 96.294-215.071 215.074 0 118.776 96.292 215.068 215.071 215.068S471.07 374.778 471.07 256.002c0-118.78-96.293-215.074-215.071-215.074z"/><path d="M381.407 207.456h-81.964c-9.08 0-10.778-7.191-7.534-16.765 3.198-9.442 6.567-21.166 6.567-35.865 0-18.414-10.757-41.97-28.877-41.97-11.236 0-7.264 32.144-22.979 66.615-8.754 19.201-31.548 51.729-41.031 60.3v96.463c4.617 7.395 17.269 23.91 38.191 23.91 19.279 0 106.609-.065 106.609-.065 27.754 0 28.066-34.917 9.716-37.921l4.978.175c17.566-1.894 24.937-33.098 2.472-38.779l4.189-.076c16.783-1.763 24.489-31.634 1.11-38.294l5.55-.562c24.931-.35 26.578-37.101 3.003-37.166z" style={{fill:'#8ac9f9'}}/><path className="st3" d="M205.588 230.008v118.035c0 6.687-5.429 12.102-12.103 12.102H148.35c-6.688 0-12.102-5.415-12.102-12.102V230.008c0-6.673 5.414-12.103 12.102-12.103h45.135c6.674 0 12.103 5.43 12.103 12.103z"/></svg>
    ),
    'sticker-star': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xmlSpace="preserve" className={className}><circle fill="#FFE352" cx="256" cy="256" r="246"/><circle fill="#FFB236" cx="256" cy="256" r="200"/><path fill="#FFE352" d="m256 85.777 50.061 101.434L418 203.477l-81 78.956 19.121 111.486L256 341.282l-100.122 52.637L175 282.433l-81-78.956 111.939-16.266z"/></svg>
    ),
    'sticker-smile': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className={className}><g id="_02-smile" data-name="02-smile"><circle cx="24" cy="24" r="23" style={{fill:'#ffce52'}}/><ellipse style={{fill: '#273941'}} cx="33" cy="18" rx="3" ry="4"/><ellipse style={{fill: '#273941'}} cx="15" cy="18" rx="3" ry="4"/><path style={{fill: '#273941'}} d="M24 39c-7.72 0-14-5.832-14-13h2c0 6.065 5.383 11 12 11s12-4.935 12-11h2c0 7.168-6.28 13-14 13z"/></g></svg>
    ),
    'sticker-question': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xmlSpace="preserve" className={className}><circle fill="#6E83B7" cx="256" cy="256" r="246"/><circle fill="#466089" cx="256" cy="256" r="200"/><g><path fill="#EDEFF1" d="M276.02 351h-40v-89.36c0-23.401 19.097-42.439 42.571-42.439 20.087 0 36.429-16.194 36.429-36.101 0-19.905-16.342-36.1-36.429-36.1h-45.143c-20.087 0-36.429 16.194-36.429 36.1h-40c0-41.962 34.286-76.1 76.429-76.1h45.143c42.143 0 76.429 34.138 76.429 76.1s-34.286 76.1-76.429 76.1c-1.418 0-2.571 1.095-2.571 2.439V351z"/><circle fill="#EDEFF1" cx="256" cy="395" r="26"/></g></svg>
    ),
    'sticker-homework': (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className={className}><defs><linearGradient id="a" x1="32" y1="57.02" x2="32" y2="19" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#54a5ff"/><stop offset="1" stopColor="#8ad3fe"/></linearGradient><linearGradient id="b" x1="11" y1="34.5" x2="32" y2="34.5" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#d3e6f5"/><stop offset="1" stopColor="#f0f7fc"/></linearGradient><linearGradient id="c" x1="32" x2="53" xlinkHref="#b"/><linearGradient id="d" x1="43" y1="40" x2="43" y2="7" gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#fe9661"/><stop offset="1" stopColor="#ffb369"/></linearGradient></defs><g id="Homework"><path d="M53 19h2a2 2 0 0 1 2 2v31a2 2 0 0 1-2 2H38.8a3.36 3.36 0 0 0-2.8 1.5c-1.2 1.82-3 1.5-5.2 1.5-3.07 0-2.53-3-5.6-3H9a2 2 0 0 1-2-2V21a2 2 0 0 1 2-2h2" style={{fill:'url(#a)'}}/><path d="M32 19v34a6.75 6.75 0 0 0-5.61-3H13a2 2 0 0 1-2-2V18a2 2 0 0 1 2-2h13.39A6.75 6.75 0 0 1 32 19z" style={{fill:'url(#b)'}}/><path d="M46 16h5a2 2 0 0 1 2 2v30a2 2 0 0 1-2 2H37.61A6.75 6.75 0 0 0 32 53V19c2.17-3.25 5.17-3 8-3" style={{fill:'url(#c)'}}/><path style={{fill:'#b4cde1'}} d="M27 44h-1v-5a1 1 0 0 0-2 0v5h-2v-6a1 1 0 0 0-2 0v6h-2v-3a1 1 0 0 0-2 0v3h-1a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2zM27 23h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2zM27 28H16a1 1 0 0 1 0-2h11a1 1 0 0 1 0 2zM25 33h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2z"/><path d="m46 35-3 5-3-5V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2z" style={{fill:'url(#d)'}}/><path style={{fill:'#b4cde1'}} d="M46 35a5 5 0 0 0-6 0l3 5z"/><path style={{fill:'#eb7f58'}} d="M40 14h6v4h-6z"/></g></svg>
    ),
    'sticker-love': (
      <svg id="_50" data-name="50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" className={className}><circle cx="256" cy="256" r="256" style={{fill:'#f9eaa5'}}/><path d="M403 288.18 273.19 418a24.3 24.3 0 0 1-34.38 0L131.06 310.27 109 288.18a88.35 88.35 0 1 1 124.92-124.94l22.08 22.1 22.09-22.1A88.34 88.34 0 0 1 403 288.18z" style={{fill:'#e52e44'}}/></svg>
    ),
    'tag': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
        </svg>
    ),
    'calculator': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V13.5Zm0 2.25h.008v.008H8.25v-.008Zm0 2.25h.008v.008H8.25V18Zm2.498-6.75h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V13.5Zm0 2.25h.007v.008h-.007v-.008Zm0 2.25h.007v.008h-.007V18Zm2.504-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5Zm0 2.25h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V18Zm2.498-6.75h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V13.5ZM8.25 6h7.5v2.25h-7.5V6ZM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0 0 12 2.25Z" />
</svg>

    ),
    'new-canvas': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
      </svg>
    ),
    select: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672 13.684 16.6m0 0-2.51 2.225.569-9.47 5.227 7.917-3.286-.672ZM12 2.25V4.5m5.834.166-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243-1.59-1.59" />
      </svg>
    ),
    hand: (
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 1 0-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 0 1 3.15 0v1.5m-3.15 0 .075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 0 1 3.15 0V15M6.9 7.575a1.575 1.575 0 1 0-3.15 0v8.175a6.75 6.75 0 0 0 6.75 6.75h2.018a5.25 5.25 0 0 0 3.712-1.538l1.732-1.732a5.25 5.25 0 0 0 1.538-3.712l.003-2.024a.668.668 0 0 1 .198-.471 1.575 1.575 0 1 0-2.228-2.228 3.818 3.818 0 0 0-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0 1 16.35 15m.002 0h-.002" />
      </svg>
    ),
    pen: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
      </svg>
    ),
    highlighter: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
      </svg>
    ),
      text: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            viewBox="0 0 6.827 6.827"
            className={className}
            style={{
            shapeRendering: 'geometricPrecision',
            textRendering: 'geometricPrecision',
            }}
            fillRule="evenodd"
            clipRule="evenodd"
        >
            <g>
            <path fill="none" d="M0 0h6.827v6.827H0z" />
            <path fill="none" d="M.853.853h5.12v5.12H.853z" />
            <path
                d="M5.382 3.794a2.66 2.66 0 0 1-.595.139c-.15.02-.257.045-.318.072a.31.31 0 0 0-.195.292c0 .098.037.179.11.244.074.064.181.096.323.096.14 0 .266-.03.375-.092a.57.57 0 0 0 .242-.252.876.876 0 0 0 .058-.365v-.134zm.03.815a1.383 1.383 0 0 1-.39.244c-.124.047-.259.07-.402.07-.236 0-.418-.057-.545-.173a.574.574 0 0 1-.19-.443.593.593 0 0 1 .26-.499.893.893 0 0 1 .263-.119 2.58 2.58 0 0 1 .323-.055c.295-.035.512-.076.651-.126l.003-.094c0-.149-.035-.254-.104-.314-.093-.083-.232-.124-.415-.124-.172 0-.298.03-.38.09-.082.06-.143.166-.182.32l-.356-.05a.886.886 0 0 1 .16-.37.699.699 0 0 1 .322-.216c.14-.05.303-.077.488-.077.184 0 .333.023.448.066.115.043.2.097.254.163a.58.58 0 0 1 .113.248c.012.062.018.174.018.336v.487c0 .34.008.554.024.643a.81.81 0 0 0 .092.259h-.381a.771.771 0 0 1-.073-.266z"
                fill="#5f5f5f"
                fillRule="nonzero"
            />
            <path
                d="M1.817 3.654h1.008l-.31-.822a8.099 8.099 0 0 1-.21-.616c-.039.19-.092.38-.161.567l-.327.871zM.96 4.874l1.141-2.97h.424l1.216 2.97h-.448l-.347-.9H1.704l-.326.9H.96z"
                fill="#727272"
                fillRule="nonzero"
            />
            </g>
        </svg>
    ),
    bold: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 3h6.75c2.485 0 4.5 2.015 4.5 4.5S15.235 12 12.75 12H6V3zm0 9h7.5c2.071 0 3.75 1.679 3.75 3.75S15.571 21 13.5 21H6v-9z" />
      </svg>
    ),
    italic: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 3h6m-6.75 18h6.75M12 3l-3 18" />
      </svg>
    ),
    rectangle: (
      <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" className={className} fill="currentColor">
        <path d="M16 13.5H0v-10h16zm-15-1h14v-8H1z"/>
      </svg>
    ),
    circle: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      </svg>
    ),
    triangle: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25L1.5 21.75h21L12 2.25z" />
        </svg>
    ),
    pentagon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25l9.49 6.908-3.626 11.454H6.136L2.51 9.158 12 2.25z" />
        </svg>
    ),
    eraser: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" className={className} fill="currentColor">
        <g id="eraser">
            <path d="M7 21.38h3.5a1 1 0 0 0 .68-.26l2.43-2.21a1.2 1.2 0 0 0 .67.27h.06a1.18 1.18 0 0 0 .8-.31l8.6-7.82a1.18 1.18 0 0 0 .08-1.68L16.7 1.51a1.13 1.13 0 0 0-.82-.39 1.21 1.21 0 0 0-.86.31l-8.6 7.81a1.17 1.17 0 0 0-.39.83 1.15 1.15 0 0 0 .21.69l-4.07 3.69a1.6 1.6 0 0 0-.52 1A1.42 1.42 0 0 0 2 16.56l4 4.37a1.4 1.4 0 0 0 1 .45zM7.09 10l8.61-7.83a.16.16 0 0 1 .12 0 .17.17 0 0 1 .14.05l7.14 7.87a.2.2 0 0 1 0 .26l-8.6 7.82a.21.21 0 0 1-.27 0l-.23-.29-3.36-3.7-3.56-3.93a.19.19 0 0 1 .01-.25zm-4.35 5.89a.4.4 0 0 1-.09-.32.58.58 0 0 1 .19-.38l4-3.67 6.05 6.66-2.4 2.19.33.37-.34-.37H7a.37.37 0 0 1-.31-.13z"/>
            <path d="M11.29 8.69a.5.5 0 0 0 .34-.13l4.44-4a.5.5 0 0 0 0-.71.49.49 0 0 0-.7 0L11 7.82a.5.5 0 0 0 .33.87zM9.07 10.71a.5.5 0 0 0 .34-.13l.74-.67a.5.5 0 0 0-.68-.74l-.74.67a.5.5 0 0 0 0 .71.49.49 0 0 0 .34.16zM18.5 22h-12a.5.5 0 0 0 0 1h12a.5.5 0 0 0 0-1zM23.69 22a.5.5 0 0 0-.38 0 .36.36 0 0 0-.16.11.5.5 0 0 0 .35.85.43.43 0 0 0 .19 0 .36.36 0 0 0 .16-.11.48.48 0 0 0 0-.7.36.36 0 0 0-.16-.15zM21.5 22h-1a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"/>
        </g>
      </svg>
    ),
    upload: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    save: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
      </svg>
    ),
    zoomIn: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
      </svg>
    ),
    zoomOut: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
      </svg>
    ),
    trash: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
      </svg>
    ),
    undo: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
      </svg>
    ),
    redo: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3" />
      </svg>
    ),
    'cloud-upload': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75z" />
        </svg>
    ),
    'cloud-download': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
        </svg>
    ),
    'share': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.186 2.25 2.25 0 0 0-3.933 2.186Z" />
      </svg>
    ),
    'copy': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375-3.375-3.375m0 0A9.01 9.01 0 0 1 12 5.625a9.01 9.01 0 0 1 7.5 4.25" />
      </svg>
    ),
    'exit': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
      </svg>
    ),
    'present': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
    'arrow-left-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 9-3 3m0 0 3 3m-3-3h7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    'arrow-right-circle': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    'fit-to-screen': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    'arrows-right-left': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    'arrows-up-down': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
      </svg>
    ),
    'checklist': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    'timer': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    'menu': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
      </svg>
    ),
    'photo': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    'shapes': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 15.75V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    ),
    'layers': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L12 15 6.429 12" />
      </svg>
    ),
    'eye': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.432 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
    'eye-slash': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    ),
    'fullscreen': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    'exit-fullscreen': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" />
      </svg>
    ),
    'user': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
      </svg>
    ),
    'users': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
        </svg>
    ),
    'inbox': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
        </svg>
    ),
    'send': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
        </svg>
    ),
    'qrcode': (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z" />
        </svg>
    ),
    'grid': (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 8.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 15.75V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    )
  };

  return icons[name] || <div />;
};
