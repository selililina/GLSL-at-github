// Author:
// Title: 
#ifdef GL_ES
precision mediump float;
#endif
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_tex0 ; //不要亂動它（已經格式化的東西？）的變數類型
//data裡放上patern（雜亂圖）跟底圖圖片（例如蒙娜麗莎）
//index檔案裡放上自己要更換的照片
//html<body>下一行canvas改底圖，以及hatch的5張圖

//下面是雜訊
vec2 hash2( vec2 x )           //亂數範圍 [0,1]
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    x = x*k + k.yx;
    return fract( 16.0 * k*fract( x.x*x.y*(x.x+x.y)) );
}
float gnoise( in vec2 p )       //亂數範圍 [0,1]
{
    vec2 i = floor( p );
    vec2 f = fract( p );   
    vec2 u = f*f*(3.0-2.0*f);
    return mix( mix( dot( hash2( i + vec2(0.0,0.0) ), f - vec2(0.0,0.0) ), 
                     dot( hash2( i + vec2(1.0,0.0) ), f - vec2(1.0,0.0) ), u.x),
                mix( dot( hash2( i + vec2(0.0,1.0) ), f - vec2(0.0,1.0) ), 
                     dot( hash2( i + vec2(1.0,1.0) ), f - vec2(1.0,1.0) ), u.x), u.y);
}

//hatching
float texh (in vec2 p, in float theshold)
{
	float rz= 1.0;
	
	// i++;
    // i += 1;
    
    // i = i + 1;
    
    int x = 8;
    
    x = 8;
    x = x + 5;
    
	for (int i=0; i<7; i++) //第一個是起始點（不見得一定要）、第二個是進入迴圈的條件、每完成一次迴圈要做的事情
	{	
        //迴圈數字越大越密 數值從0到12
 		float g = gnoise(vec2(1.,80.)*p);//迴圈數改成i小於1，(用逆向的方法這個pattern用noise畫出來)，用uv的座標系統過來 float g = gnoise(vec2(1.,30.)*p); 30是亂數的幾倍
    	//亂數範圍 [0,1] noise(1.,80.) 代表80倍 g=smoothstep(0.1, 0.3,g);
   		g=smoothstep(0.1,0.3,g);//在某一定的範圍畫成全白，某一定的範圍畫成全黑
		rz = min(1.-g,rz);//定義rzg是noise的結果去畫出來，1去剪掉g做黑白的反轉， //取小的，取黑色的意思
		p.xy = p.yx;//橫軸與中軸對換
		p += 0.1;//下一次去畫的偏移數值
		p*= 1.2;//下一次畫的線搞，P乘以1.2密度變化，每一次迴圈密度是筆刷多少的倍數。
		//if(float(i)/12.0 < theshold)break;//在當...實會有
		if(1.0-float(i)/12.0 < theshold*1.05+0.1) break;
    }
    
	return rz;
}

void main()
{
	vec2 uv = gl_FragCoord.xy/u_resolution.xy; //uv只是一個自定義的名稱，在這裡是代表xy的相對座標系統
	//uv.x *= u_resolution.x/u_resolution.y;
	//uv= uv*2.0-1.0;
	vec4 info=texture2D(u_tex0,uv);//把蒙娜麗莎的圖檔讀進來 float lisa=info.g;
	vec3 col=vec3(texh(uv*3.0,.1));//什麼時候要終止迴圈，終止後判定明暗度
	gl_FragColor = vec4(col, 1.0);
}

