
var AMOUNT_WANDS = 35;

GamePlayManager = {
    init: function() {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        this.flagFirstMouseDown = false;
        this.amountDiamondsCaught = 0;
        this.endGame = false;
        this.countSmile = -1;
    },
    preload: function() {
        game.load.image('fondo', 'assets/images/fondo.jpg');
        game.load.spritesheet('kirby', 'assets/images/mini.png', 31, 32, 12);
        game.load.spritesheet('star', 'assets/images/varitap.png', 300, 520, 1);
        game.load.image('explosion', 'assets/images/pink.png');

        game.load.audio('fondo', 'assets/sounds/cloud.mp3');
    },
    create: function() {
        game.add.sprite(0, 0, 'fondo');
        this.kirby = game.add.sprite(0, 0, 'kirby');
        this.kirby.scale.setTo(3.5);
        this.kirby.animations.add('walk', [0,1,2,3,4,5,6,7,8,9,10,11,12],5,true);
        this.kirby.animations.play('walk');

        sonido = game.add.audio('fondo');
        sonido.play('', 0, 0.5, true);

        this.kirby.x = game.width/2;
        this.kirby.y = 700;

        game.input.onDown.add(this.onTap, this);
        
        this.stars = [];
        for(var i=0; i<AMOUNT_WANDS; i++){
            var star = game.add.sprite(200,200,'star');
            star.frame = game.rnd.integerInRange(0,3);
            star.scale.setTo(0.15);
            star.anchor.setTo(0.5);
            star.x = game.rnd.integerInRange(30, 480);
            star.y = game.rnd.integerInRange(30, 800);
            
            this.stars[i] = star;
            var rectCurrenDiamond = this.getBoundsDiamond(star);
            var rectHorse = this.getBoundsDiamond(this.kirby);
            
            while(this.isOverlapingOtherDiamond(i, rectCurrenDiamond) || this.isRectanglesOverlapping(rectHorse, rectCurrenDiamond) ){
                star.x = game.rnd.integerInRange(30,480);
                star.y = game.rnd.integerInRange(30, 800);
                rectCurrenDiamond = this.getBoundsDiamond(star);
            }
        }
        
        this.explosionGroup = game.add.group();
       
        for(i=0; i<10; i++){
            this.explosion = this.explosionGroup.create(100,100,'explosion');
            this.explosion.tweenScale = game.add.tween(this.explosion.scale).to({
                            x: [0.4, 0.8, 0.4],
                            y: [0.4, 0.8, 0.4]
                }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.tweenAlpha = game.add.tween(this.explosion).to({
                            alpha: [1, 0.6, 0]
                }, 600, Phaser.Easing.Exponential.Out, false, 0, 0, false);

            this.explosion.anchor.setTo(0.5);
            this.explosion.kill();
        }
        
        this.currentScore = 0;
        var style = {
            font: 'bold 25pt sans-serif',
            fill: '#00000',
            align: 'center'
          }
        
        this.scoreText = game.add.text(game.width/2, 40, '0', style);
        this.scoreText.anchor.setTo(0.5);
        
        this.totalTime = 30;
        this.timerText = game.add.text(460, 40, this.totalTime+'', style);
        this.timerText.anchor.setTo(0.5);
        
        this.timerGameOver = game.time.events.loop(Phaser.Timer.SECOND, function(){
            if(this.flagFirstMouseDown){
                this.totalTime--;
                this.timerText.text = this.totalTime+'';
                if(this.totalTime<=0){
                    game.time.events.remove(this.timerGameOver);
                    this.endGame = true;
                    this.showFinalMessage('GAME OVER');
                }
            }
        },this);        
    },
    increaseScore:function(){
        this.countSmile = 0;
        this.kirby.frame = 1;
        
        this.currentScore+=100;
        this.scoreText.text = this.currentScore;
        
        this.amountDiamondsCaught += 1;
        if(this.amountDiamondsCaught >= AMOUNT_WANDS){
            game.time.events.remove(this.timerGameOver);
            this.endGame = true;
            this.showFinalMessage('YOU WIN  ¡CONGRATS!');
        }
    },
    showFinalMessage:function(msg){
        var bgAlpha = game.add.bitmapData(game.width, game.height);
        bgAlpha.ctx.fillStyle = '#000000';
        bgAlpha.ctx.fillRect(0,0,game.width, game.height);
        
        var bg = game.add.sprite(0,0,bgAlpha);
        bg.alpha = 0.5;
        
        var style = {
            font: 'bold 30pt Arial',
            fill: '#FFFFFF',
            align: 'center'
          }
        
        this.textFieldFinalMsg = game.add.text(game.width/2, game.height/2, msg, style);
        this.textFieldFinalMsg.anchor.setTo(0.5);
    },
    onTap:function(){
        this.flagFirstMouseDown = true;
    },
    getBoundsDiamond:function(currentDiamond){
        return new Phaser.Rectangle(currentDiamond.left, currentDiamond.top, currentDiamond.width, currentDiamond.height);
    },
    isRectanglesOverlapping: function(rect1, rect2) {
        if(rect1.x> rect2.x+rect2.width || rect2.x> rect1.x+rect1.width){
            return false;
        }
        if(rect1.y> rect2.y+rect2.height || rect2.y> rect1.y+rect1.height){
            return false;
        }
        return true;
    },
    isOverlapingOtherDiamond:function(index, rect2){
        for(var i=0; i<index; i++){
            var rect1 = this.getBoundsDiamond(this.stars[i]);
            if(this.isRectanglesOverlapping(rect1, rect2)){
                return true;
            }
        }
        return false;
    },
    getBoundsHorse:function(){
        var x0 = this.kirby.x - Math.abs(this.kirby.width)/4;
        var width = Math.abs(this.kirby.width)/2;
        var y0 = this.kirby.y - this.kirby.height/2;
        var height = this.kirby.height;
        
        return new Phaser.Rectangle(x0, y0,width,height);
    },
    render:function(){
        //game.debug.spriteBounds(this.horse);
        for(var i=0; i<AMOUNT_WANDS; i++){
            //game.debug.spriteBounds(this.diamonds[i]);
        }
    },
    
    update: function() {
        console.log("update");
        if(this.flagFirstMouseDown && !this.endGame){
            
            if(this.countSmile>=0){
                this.countSmile++;
                if(this.countSmile>50){
                    this.countSmile = -1;
                    this.kirby.frame = 0;
                }
            }

            var pointerX = game.input.x;
            var pointerY = game.input.y;

            var distX = pointerX - this.kirby.x;
            var distY = pointerY - this.kirby.y;

            if(distX>lol){
                this.kirby.scale.setTo(3.5,3.5);
                lol=0;
            }
            else{
                this.kirby.scale.setTo(-3.5,3.5);
                lol=0;
            }
            this.kirby.x += distX * 0.05;
            this.kirby.y += distY * 0.05;
            for(i=0; i<AMOUNT_WANDS; i++){
                    var rectHorse = this.getBoundsHorse();
                    var rectDiamond = this.getBoundsDiamond(this.stars[i]);
                    if(this.stars[i].visible && this.isRectanglesOverlapping(rectHorse, rectDiamond)){
                        this.increaseScore();
                        this.stars[i].visible = false;
                        var explosion = this.explosionGroup.getFirstDead();
                        if(explosion!=null){
                            explosion.reset(this.stars[i].x, this.stars[i].y);
                            explosion.tweenScale.start();
                            explosion.tweenAlpha.start();
                            explosion.tweenAlpha.onComplete.add(function (currentTarget, currentTween) {
                            currentTarget.kill();
                        }, this);
                    }
                    
                }
            }
        }
    }
}

var game = new Phaser.Game(500, 899, Phaser.CANVAS);
var sonido;
var t=5,lol=140,vx=80,hy=200;

game.state.add("gameplay", GamePlayManager);
game.state.start("gameplay");
game.sonido.play("gameplay");