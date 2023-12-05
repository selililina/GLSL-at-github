// Author:CMH
// Title:TheGameofPixels 
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0; //data/MonaLisa.jpg
//uniform sampler2D u_tex1;

void main() 
{
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    //st.x *= u_resolution.x/u_resolution.y;
    float paraX = (sin(u_time*0.1)*0.5+0.5)*45.;
    float paraY = (cos(u_time*0.05)*0.5+0.5)*125.;
    //vec2 brickSize=vec2(paraX+5.0, paraY+3.0) ;
    vec2 brickSize=vec2(paraX, paraY) ;//n_mouse*60.0
    //連續性數值單位化的作法
    vec2 uv=st; //[0~1] //做放大
    vec2 uvs=uv* brickSize;//[0~6]
    vec2 ipos = floor(uvs);  // get the integer coords 整數
    vec2 fpos = fract(uvs);  // get the fractional coords 小數
    vec2 nuv=ipos/brickSize;

    vec3 color = vec3(0.);
    color = texture2D(u_tex0, nuv).rgb;   // u_tex0是蒙娜麗莎的圖，ipos整數圖檔、nuv
    gl_FragColor = vec4(vec3(color),1.0);
}