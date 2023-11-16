// Author:CMH
// Title:BreathingGlow+noise

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time; //utime是變數， float是變數型別，
//資料型別-名稱（）-{return資料 混合資料型別}

float glow(float d, float str, float thickness){
    return thickness / pow(d, str);
}

vec2 hash2( vec2 x )            //亂數範圍 [-1,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return -1.0 + 2.0*fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [-1,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );
    
    vec2 u = f*f*(3.0-2.0*f);

    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                            dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                         mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                            dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}
#define Use_Perlin
//#define Use_Value
float noise( in vec2 p )        //亂數範圍 [-1,1]
{
#ifdef Use_Perlin    
return gnoise(p);   //gradient noise
#elif defined Use_Value
return vnoise(p);       //value noise
#endif    
return 0.0;
}
float fbm(in vec2 uv)       //亂數範圍 [-1,1]
{
    float f;                                                //fbm - fractal noise (4 octaves)
    mat2 m = mat2( 1.6,  1.2, -1.2,  1.6 );
    f   = 0.5000*noise( uv ); uv = m*uv;          
    f += 0.2500*noise( uv ); uv = m*uv;
    f += 0.1250*noise( uv ); uv = m*uv;
    f += 0.0625*noise( uv ); uv = m*uv;
    return f;
}

float M_SQRT_2=1.41421356237;
float heart(vec2 P, float size)
{
	float x = M_SQRT_2/2.0 * (P.x - P.y);
    float y = M_SQRT_2/2.0 * (P.x + P.y);
    float r1 = max(abs(x),abs(y))-size/3.5;
    float r2 = length(P - M_SQRT_2/2.0*vec2(+1.0,-1.0)*size/3.5)
             - size/3.5;
    float r3 = length(P - M_SQRT_2/2.0*vec2(-1.0,-1.0)*size/3.5)
 - size/3.5;
   return min(min(r1,r2),r3);
}
//問：想改成下面形狀但無法成功
float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdRhombus( in vec2 p, in vec2 b ) 
{
    p = abs(p);
    float h = clamp( ndot(b-2.0*p,b)/dot(b,b), -1.0, 1.0 );
    float d = length( p-0.5*b*vec2(1.0-h,1.0+h) );
    return d * sign( p.x*b.y + p.y*b.x - b.x*b.y );
}

//放在void main前面是欲改成其他圖形的程式碼
void main() {
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
    uv.x *= u_resolution.x/u_resolution.y;
    uv= uv*2.0-1.0;
    
    //陰晴圓缺
    float pi=3.14159;
    float theta=2.0*pi*u_time/8.0;
    vec2 point=vec2(sin(theta), cos(theta));
    float dir= dot(point, (uv))+0.55;
    
    //亂數作用雲霧
    float fog= fbm(0.4*uv+vec2(-0.1*u_time, -0.02*u_time))*0.6+0.1; //fbm期中一種noise（亂數）的用法

    //定義圓環
    float dist = length(uv);
    float circle_dist = abs(dist-0.512);                                //光環大小
    
	float result;
    float radius = 0.944;
    vec2 size;
    size.x = 1.0;
    size.y = 0.6;
    
    for(int index=0; index<6; ++index) //迴圈開始
	{
        //model heart
        vec2 uv_flip = vec2(uv.x,-uv.y);
        float weight = step(uv.y,0.228);
        float noise = gnoise(uv_flip*10.592)*-0.104*weight;
        float dist = abs(sdRhombus(uv, size)); //heart改成欲變化圖形的名字

        //動態呼吸
        float breathing=sin(2.0*u_time/5.0*pi)*0.5+0.2;                     //option1
        //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412;         //option2 錯誤
         //float breathing=(exp(sin(u_time/2.0*pi)) - 0.36787944)*0.42545906412;                //option2 正確
        float strength =(0.368*breathing+0.364);          //[0.2~0.3]         //光暈強度加上動態時間營造呼吸感
        float thickness=(-0.148*breathing+0.124);          //[0.1~0.2]         //光環厚度 營造呼吸感
        float glow_circle = glow(dist, strength, thickness);
        result+= glow_circle;
    }
        
    gl_FragColor = vec4((vec3(result)+fog)*vec3(1.000,0.281,0.010),1.0);
}