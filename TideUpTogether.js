var Address = 'tideuptogether.kro.kr';

(function() {
    
    const LIVE_MESSAGE_COUNT = 50;
    
    const PACKET = {
        
        INITIAL_SYNC: "init",
        SYNC:         "sync",
        TRANSFER:     "transfer"
    }
    
    const BROADCAST = {
        
        INIT:  "init",
        LEAVE: "leave",
        JOIN:  "join"
    }
    
    const MessageType = {
        
        One: 0,
        Two: 1
    }
    
    const WordType = {
        
        Location:   0,
        Action:     1,
        Subject:    2,
        Direction:  3,
        Object:     4,
        Wisper:     5
    }
    
    var OnlineStatus;
    
    function Game_DummyCharacter() {
            
        this.initialize.apply(this, arguments);
    }
    
    function Window_Blank() {
        
        this.initialize.apply(this, arguments);
        this.setBackgroundType(2);
    }
    
    Window_Blank.prototype = Object.create(Window_Base.prototype);
    
    Window_Blank.prototype.standardPadding = function() {
        return 0;
    };
    
    Window_Blank.prototype.textPadding = function() {
        return 0;
    };
    
    function TUTMessage() {
        
        this.hasServerData = false;
        
        this.x = 0;
        this.y = 0;
        
        this.type = MessageType.One;
        
        this.firstWordBase = -1;
        this.firstWordType = -1;
        this.firstWordId   = -1;
        
        this.adverb = 0;
        
        this.secondWordBase = -1;
        this.secondWordType = -1;
        this.secondWordId   = -1;
    }
    
    TUTMessage.Data = Papa.parse(
            TUT_RAW_MSG_CSV_TABLE.substring(0, TUT_RAW_MSG_CSV_TABLE.length - 1)
        )
        .data       //parse CSV
        .map(msg => msg.filter(str => !!str))   //excluding empty strings
        .reduce((target, value, index) => {     //organize data
            
            var value = {
                name: value.shift(),
                list: value
            };
            
            switch (index) {
                
                case 1: target.base   = value; break;
                case 8: target.adverb = value; break;
                
                default: target[index - 2] = value; break;
            }
            
            return target;
        });
    
    console.log("Parsed message table data : ");
    console.log(TUTMessage.Data);
    
    TUTMessage.prototype.CreateServerData = function() {
        
        //CommentData.cs
        return {
            
            map: $gameMap.mapId(),
            x: $gamePlayer.x,
            y: $gamePlayer.y,
            
            type: this.type,
            
            fpara:      this.firstWordBase,
            fword_type: this.firstWordType,
            fword:      this.firstWordId,
            
            adverb: this.adverb,
            
            spara:      this.secondWordBase,
            sword_type: this.secondWordType,
            sword:      this.secondWordId
        }
    }
    
    TUTMessage.prototype.ApplyServerData = function(data) {
        
        if (!data) {
            
            TUTMessage.call(this);
            return;
        }
        
        try {
            
            //CommentData.cs
            this.type = data.type;
            
            this.x = data.x;
            this.y = data.y;
            
            this.firstWordBase = data.fpara;
            this.firstWordType = data.fword_type;
            this.firstWordId   = data.fword;
            
            this.adverb = data.adverb;
            
            this.secondWordBase = data.spara;
            this.secondWordType = data.sword_type;
            this.secondWordId   = data.sword;
            
            this.hasServerData = true;
            
        } catch (err) {
            
            TUTMessage.call(this);
        }
    }
    
    TUTMessage.prototype.ToString = function(hideError) {
        
        switch (this.type) {
            
            default: return hideError ? '' : 'unknown type';
            
            case MessageType.One:
                return TUTMessage.MakeParagraph(this.firstWordBase, this.firstWordType, this.firstWordId, hideError);
                
            case MessageType.Two:
                
                if (this.adverb < 0 || this.adverb >= TUTMessage.Data.adverb.list.length)
                    return hideError ? ' ' : 'unknown adverb';
                
                if (!this.lineBreak)
                    return TUTMessage.MakeParagraph(this.firstWordBase, this.firstWordType, this.firstWordId, hideError)
                         + TUTMessage.Data.adverb.list[this.adverb]
                         + TUTMessage.MakeParagraph(this.secondWordBase, this.secondWordType, this.secondWordId, hideError);
                
                else
                    return TUTMessage.MakeParagraph(this.firstWordBase, this.firstWordType, this.firstWordId, hideError)
                         + TUTMessage.Data.adverb.list[this.adverb] + '\n'
                         + TUTMessage.MakeParagraph(this.secondWordBase, this.secondWordType, this.secondWordId, hideError);
        }
    }
    
    TUTMessage.MakeParagraph = function(base, wordType, wordId, hideError) {
        
        if (base < 0 || base >= TUTMessage.Data.base.list.length)
            return hideError ? '' : 'unknown base';
        
        if (wordType < 0 || wordType >= TUTMessage.Data.length)
            return hideError ? TUTMessage.Data.base.list[base] : 'unknown word type';
        
        var words = TUTMessage.Data[wordType].list;
        
        if (wordId < 0 || wordId >= words.length)
            return hideError ? TUTMessage.Data.base.list[base] : 'unknown word id';
        
        return TUTMessage.Data.base.list[base].replace('~', words[wordId]);
    }
    
    TUTMessage.GetStringBase = function(base) {
        
        if (base < 0 || base >= TUTMessage.Data.base.list.length)
            return '';
        
        return TUTMessage.Data.base.list[base];
    }
    
    TUTMessage.GetAdverb = function(adverb) {
        
        if (this.adverb < 0 || this.adverb >= TUTMessage.Data.adverb.list.length)
            return '';
        
        return TUTMessage.Data.adverb.list[adverb];
    }
    
    TUTMessage.GetStringWord = function(wordType, wordId) {
        
        if (wordType < 0 || wordType >= TUTMessage.Data.length)
            return '';
        
        var words = TUTMessage.Data[wordType].list;
        
        if (wordId < 0 || wordId >= words.length)
            return '';
        
        return words[wordId];
    }
    
    function Sprite_TUTMessage() {
        this.initialize.apply(this, arguments);
    }
    
    Sprite_TUTMessage.prototype = Object.create(Sprite_Character.prototype);
    Sprite_TUTMessage.prototype.constructor = Sprite_TUTMessage;

    Sprite_TUTMessage.prototype.initialize = function() {
        
        var character = new Game_CharacterBase();
        
        character.setPriorityType(2);
        character.setTransparent(false);
        
        Sprite_Character.prototype.initialize.call(this, character);
        
        this.data = new TUTMessage();
        this.data.lineBreak = true;
        
        this.fromX = 0;
        this.fromY = 0;
        this.fromRotate = 0;
        this.fromAlpha = 0;
        
        this.toX = 0;
        this.toY = 0;
        this.toRotate = 0;
        this.fromAlpha = 1;
        
        this.appearDuration = 0;
        this.hideDuration   = 0;
        
        this.window = new Window_Blank(0, 0, 200, Window_Base.prototype.lineHeight() * 1.5);
        this.window.setBackgroundType(2);
        this.window.open();
        
        this.window.pivot.set(this.window.width / 2, this.window.height / 2);
        
        this.addChild(this.window);
        
        this.frameCount = 0;
        this.refreshFloatingInfo();
    }
    
    Sprite_TUTMessage.prototype.ApplyServerData = function(data, forceInit) {
        
        this.data.ApplyServerData(data);
        this.frameCount = 0;
        
        if (!forceInit) {
            
            this.hasServedNewData = true;
            
            this.hideDuration = 180 + Math.random() * 420;
            this.refreshFloatingInfo(true);
        }
        
        else {
            
            this.hasServedNewData = false;
            this.window.alpha = 0;
            this.window.contents.clear();
            this.refreshFloatingInfo();
        }
    }
    
    Sprite_TUTMessage.prototype.refreshFloatingInfo = function(relativeTo) {
        
        this.fromX = -10 + Math.random() * 20;
        this.fromY = -10 + Math.random() * 20;
        this.fromRotate = (-10 + Math.random() * 20) * (Math.PI / 180);
        this.fromAlpha = 0;
        
        if (!relativeTo) {
            
            this.toX = -10 + Math.random() * 20;
            this.toY = -10 + Math.random() * 20;
            this.toRotate = (-10 + Math.random() * 20) * (Math.PI / 180);
            this.toAlpha = 0.85 + Math.random() * 0.15;
            
        } else {
            
            this.toX = this.window.x;
            this.toY = this.window.y;
            this.toRotate = this.window.rotation;
            this.toAlpha = this.window.alpha;
        }
    }
    
    Sprite_TUTMessage.prototype.update = function() {
        
        if (this.hasServedNewData) {
            
            if (this.frameCount < this.hideDuration) {
                
                this.frameCount++;
                this.updateFloatingNormal(1 - this.frameCount / this.hideDuration);
            }
            
            else {
                
                this.window.alpha = 0;
                
                this._character.setTransparent(true);
                this.hasServedNewData = false;
                this.frameCount = 0;
            }
            
        } else if (this.data.hasServerData) {
            
            if (this.frameCount == 0) {
                
                this.refreshFloatingInfo();
                
                this.appearDuration = 180 + Math.random() * 900;
                
                this.window.contents.clear();
                
                var text = this.data.ToString(true);
                
                if (text.indexOf('\n') === -1)
                    this.window.drawText(text, 0, 0, this.window.contents.width, 'center');
                
                else {
                    
                    var adverbText = text.substring(text.indexOf('\n') + 1);
                    text = text.substring(0, text.indexOf('\n'));
                    
                    this.window.drawText(text, 0, 0, this.window.contents.width, 'center');
                    this.window.drawText(adverbText, 0, this.window.lineHeight() / 2, this.window.contents.width, 'center');
                }
                
                this._character.setTransparent(false);
                this._character.setPosition(this.data.x, this.data.y);
            }
            
            if (this.frameCount < this.appearDuration) {
                
                this.updateFloatingNormal(this.frameCount / this.appearDuration);
                this.frameCount++;
            }
            
        } else {
            
            this._character.setTransparent(true);
        }
        
        this.updateZoomLevel();
        Sprite_Character.prototype.update.call(this);
    }
    
    Sprite_TUTMessage.prototype.updateZoomLevel = function() {
        
        var zoomLevel = 0.85;
        var relativeX = this._character.x - $gamePlayer.x;
        var relativeY = this._character.y - $gamePlayer.y;
        
        var magnitude = Math.sqrt(relativeX * relativeX + relativeY * relativeY);
        
        if (magnitude < 1) {
            
            magnitude = (1 - magnitude);
            var quartInOut = magnitude < 0.5 ? 8 * magnitude * magnitude * magnitude * magnitude : 1 - Math.pow(-2 * magnitude + 2, 4) / 2;
            zoomLevel += quartInOut * 0.35;
        }
        
        this.window.scale.set(zoomLevel / $gameMap.zoomData.scale.x);
    }
    
    Sprite_TUTMessage.prototype.updateFloatingNormal = function(normal) {
        
        normal = Math.sin((normal * Math.PI) / 2);
        
        this.window.x = this.fromX + (this.toX - this.fromX) * normal;
        this.window.y = this.fromY + (this.toY - this.fromY) * normal;
        this.window.rotation = this.fromRotate + (this.toRotate - this.fromRotate) * normal;
        
        this.window.alpha = this.fromAlpha + (this.toAlpha - this.fromAlpha) * normal;
    }
    
    var LiveMessages = [];
    var LastLiveMessageFrame = 0;
    var LastLiveMessageMapID = 0;
    
    function ExitExpressionTriggered() {
        
        return Input.isTriggered('ok') || Input.isTriggered('cancel')
            || Input.isTriggered('up')
            || Input.isTriggered('down')
            || Input.isTriggered('left')
            || Input.isTriggered('right')
    }
    
    const EXPRESSION_PAIR = {
        [TUT_EXPRESSION.BOING]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.BOING],
            anim: function(data) {
            
            if (this.expressionFrame > 60) {
                
                this.expressionFrame = -1;
                return;
            }
            
            if (this.expressionFrame % 30 == 0)
                this.jump(0, 0);
            
            this.expressionFrame++;
        } },
        [TUT_EXPRESSION.DULDUL]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.DULDUL],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this._realX = this.x + ((-0.5 + Math.random()) * 2 * 2) / $gameMap.tileWidth();
            this._realY = this.y + ((-0.5 + Math.random()) * 2 * 2) / $gameMap.tileHeight();
        } },
        [TUT_EXPRESSION.DOWN]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.DOWN],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$player_down', 0);
        } },
        [TUT_EXPRESSION.DOWN_FORWARD]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.DOWN_FORWARD],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$player_PB', 0);
        } },
        [TUT_EXPRESSION.ITAI]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.ITAI],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$player_Etai', 0);
            
            var t = 1 - this.expressionFrame / 60;
            this._realX = this.x + ((-0.5 + Math.random()) * 2 * 4 * t) / $gameMap.tileWidth();
            this._realY = this.y + ((-0.5 + Math.random()) * 2 * 4 * t) / $gameMap.tileHeight();
            
            if (this.expressionFrame < 60)
                this.expressionFrame++;
        } },
        [TUT_EXPRESSION.THIEF]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.THIEF],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$player_LockPick', 0);
        } },
        [TUT_EXPRESSION.MEAT]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.MEAT],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$Player_Meat%(4)', 0);
        } },
        [TUT_EXPRESSION.MEMORY]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.MEMORY],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$Player_Memory%(4)', 0);
        } },
        [TUT_EXPRESSION.SIT_GROUND]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.SIT_GROUND],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$player_sit', 0);
        } },
        [TUT_EXPRESSION.SHIRT]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.SHIRT],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('Girl2%(4)', 0);
        } },
        [TUT_EXPRESSION.DANCE]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.DANCE],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                if (data.direction !== undefined)
                    this.setDirection(data.direction);
                
                delete data.direction;
                this.expressionFrame = -1;
                return;
            }
            
            if (data.direction === undefined)
                data.direction = this.direction();
            
            this.setStepAnime(false);
            this.setImage('$player_dance', 0);
            
            if (this.expressionFrame < 6)
                this.setDirection(2);
            
            else if (this.expressionFrame < 12)
                this.setDirection(4);
            
            else if (this.expressionFrame < 18)
                this.setDirection(6);
            
            else if (this.expressionFrame < 24)
                this.setDirection(8);
            
            if (this.expressionFrame < 24)
                this.expressionFrame++;
            
            else
                this.expressionFrame = 0;
        } },
        [TUT_EXPRESSION.INTENSE_DANCE]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.INTENSE_DANCE],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                if (data.direction !== undefined)
                    this.setDirection(data.direction);
                
                delete data.direction;
                this.expressionFrame = -1;
                return;
            }
            
            if (data.direction === undefined)
                data.direction = this.direction();
            
            this.setStepAnime(false);
            this.setImage('$player_dance', 0);
            
            if (this.expressionFrame < 3)
                this.setDirection(2);
            
            else if (this.expressionFrame < 6)
                this.setDirection(4);
            
            else if (this.expressionFrame < 9)
                this.setDirection(6);
            
            else if (this.expressionFrame < 12)
                this.setDirection(8);
            
            if (this.expressionFrame < 12)
                this.expressionFrame++;
            
            else
                this.expressionFrame = 0;
        } },
        [TUT_EXPRESSION.STONE]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.STONE],
            anim: function(data) {
            
            if (this.expressionFrame >= 90 && ExitExpressionTriggered()) {
                
                if (data.direction !== undefined)
                    this.setDirection(data.direction);
                
                delete data.direction;
                this.expressionFrame = -1;
                return;
            }
            
            if (data.direction === undefined)
                data.direction = this.direction();
            
            if (this.expressionFrame >= 10) {
                
                switch (data.direction) {
                    
                    case 2: this.setImage('$player_StoneD', 0); break;
                    case 4: this.setImage('$player_StoneL', 0); break;
                    case 6: this.setImage('$player_StoneR', 0); break;
                    case 8: this.setImage('$player_StoneU', 0); break;
                }
            }
            
            if (this.expressionFrame < 10)
                this.setImage('$player_Etai', 0);
            
            else if (this.expressionFrame < 20)
                this.setDirection(2);
            
            else if (this.expressionFrame < 30)
                this.setDirection(4);
            
            else
                this.setDirection(6);
            
            if (this.expressionFrame < 90)
                this.expressionFrame++;
            
        } },
        [TUT_EXPRESSION.BEAR]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.BEAR],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$!BearHead', 0);
        } },
        [TUT_EXPRESSION.SISTER]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.SISTER],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$Sis_R', 0);
        } },
        //Ghosts, shadows
        [TUT_EXPRESSION.GHOST]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.GHOST],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$7S2M%(4)', 0);
        } },
        [TUT_EXPRESSION.DOG_A]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.DOG_A],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$7S2MB%(4)', 0);
        } },
        [TUT_EXPRESSION.DOG_B]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.DOG_B],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$7S2MBRE%(4)', 0);
        } },
        [TUT_EXPRESSION.NIGHTMARE]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.NIGHTMARE],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$player - extra', 0);
        } },
        //Humanoids
        [TUT_EXPRESSION.GUARD]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.GUARD],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$1S2M%(4)', 0);
            this.setPattern(2);
        } },
        [TUT_EXPRESSION.BUCKET_HEAD]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.BUCKET_HEAD],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$Body2', 0);
        } },
        [TUT_EXPRESSION.PRISONER]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.PRISONER],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$1S1M%(4)', 0);
        } },
        [TUT_EXPRESSION.SOFT_MANNEQUIN]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.SOFT_MANNEQUIN],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$ManeHead 3', 0);
        } },
        [TUT_EXPRESSION.MANNEQUIN]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.MANNEQUIN],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$LB5', 0);
        } },
        //Creatures
        [TUT_EXPRESSION.SPIDER]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.SPIDER],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$CanSpi%(4)', 0);
        } },
        [TUT_EXPRESSION.TONGUE_EYES]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.TONGUE_EYES],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(true);
            this.setImage('$Head', 0);
        } },
        [TUT_EXPRESSION.SNAKE]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.SNAKE],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(true);
            this.setImage('$8S2MB%(4)', 0);
        } },
        [TUT_EXPRESSION.EARS]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.EARS],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(true);
            this.setImage('$EarBug2', 0);
        } },
        [TUT_EXPRESSION.GUTS_MAN]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.GUTS_MAN],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(true);
            this.setImage('$LB10%(4)', 0);
        } },
        [TUT_EXPRESSION.GIANT]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.GIANT],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                if (data.direction !== undefined)
                    this.setDirection(data.direction);
                
                delete data.direction;
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(true);
            this.setImage('$People_A', 0);
            
            if (data.direction === undefined) {
                
                data.direction = this.direction();
                
                switch (data.direction) {
                    
                    case 2:
                    case 6:
                        this.setDirection(2);
                        break;
                    
                    case 4:
                    case 8:
                        this.setDirection(4);
                        break;
                }
            }
            
        } },
        [TUT_EXPRESSION.PIG_MAN]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.PIG_MAN],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                if (data.direction !== undefined)
                    this.setDirection(data.direction);
                
                delete data.direction;
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(true);
            this.setImage('$pigmam%(4)', 0);
            
            if (data.direction === undefined) {
                
                data.direction = this.direction();
                this.setDirection(2);
            }
        } },
        [TUT_EXPRESSION.I_LIKE_MONEY]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.I_LIKE_MONEY],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                if (data.direction !== undefined)
                    this.setDirection(data.direction);
                
                delete data.direction;
                this.expressionFrame = -1;
                return;
            }
            
            this.setStepAnime(false);
            this.setImage('$pigmam%(4)', 0);
            
            if (data.direction === undefined) {
                
                data.direction = this.direction();
                this.setDirection(8);
            }
        } },
        //Extras
        [TUT_EXPRESSION.SPIKE]: {
            name: TUTStrings.Expressions[TUT_EXPRESSION.SPIKE],
            anim: function(data) {
            
            if (ExitExpressionTriggered()) {
                
                if (data.direction !== undefined)
                    this.setDirection(data.direction);
                
                delete data.direction;
                this.expressionFrame = -1;
                return;
            }
            
            if (data.direction === undefined)
                data.direction = this.direction();
            
            this.setImage('!Spike', 0);
            this.expressionFrame++;
            
            if (this.expressionFrame < 70)
                this.setDirection(2);
            
            else if (this.expressionFrame < 80)
                this.setDirection(4);
            
            else if (this.expressionFrame < 90)
                this.setDirection(6);
                
            else if (this.expressionFrame < 140)
                this.setDirection(8);
            
            else if (this.expressionFrame < 150)
                this.setDirection(6);
            
            else if (this.expressionFrame < 160)
                this.setDirection(4);
            
            else
                this.expressionFrame = 0;
        } }
    }
    
    var Game_Player_initialize = Game_Player.prototype.initialize;
    Game_Player.prototype.initialize = function() {
        
        Game_Player_initialize.call(this);
        
        this.expression = TUT_EXPRESSION.NOTHING;
        this.expressionFrame = -1;
    }
    
    var Game_Player_update = Game_Player.prototype.update;
    Game_Player.prototype.update = function(sceneActive) {
        
        Game_Player_update.call(this, sceneActive);
        
        this.updateExpression();
        
        if (IsConnected())
            Connection.invoke(PACKET.SYNC, this.getSyncData());
    }
    
    Game_Player.prototype.updateExpression = function() {
        
        if (this.expression === undefined)
            this.expression = TUT_EXPRESSION.NOTHING;
        
        if (this.expressionFrame === undefined)
            this.expressionFrame = -1;
        
        if (this.expressionCache === undefined)
            this.expressionCache = {
                
                name:  null,
                index: 0,
                pattern: 0
            };
        
        if (this.expression === TUT_EXPRESSION.NOTHING)
            return;
        
        if (this.expressionFrame <= -1) {
            
            this.setImage(this.expressionCache.name, this.expressionCache.index);
            this.setPattern(this.expressionCache.pattern);
            this.setStepAnime(false);
            
            this.expressionFrame = -1;
            this.expression = TUT_EXPRESSION.NOTHING;
            return;
        }
        
        if (this.expression in EXPRESSION_PAIR)
            EXPRESSION_PAIR[this.expression].anim.call(this, EXPRESSION_PAIR[this.expression]);
    }
    
    Game_Player.prototype.cacheBeforeExpression = function() {
        
        this.expressionCache.name    = this.characterName();
        this.expressionCache.index   = this.characterIndex();
        this.expressionCache.pattern = this._pattern;
    }
    
    var Game_Player_performTransfer = Game_Player.prototype.performTransfer;
    Game_Player.prototype.performTransfer = function() {
        
        console.log("moved");
        if (this.isTransferring())
            RefreshAsyncMessages();
        
        Game_Player_performTransfer.call(this);
    }
    
    var Game_Player_canMove = Game_Player.prototype.canMove;
    Game_Player.prototype.canMove = function() {
        
        if (this.expression !== TUT_EXPRESSION.NOTHING)
            return false;
        
        return Game_Player_canMove.call(this);
    };
    
    var Game_Player_reserveTransfer = Game_Player.prototype.reserveTransfer;
    Game_Player.prototype.reserveTransfer = function() {
        
        Game_Player_reserveTransfer.apply(this, arguments);
        this._lastMapId = $gameMap.mapId();
    }
    
    var Game_Player_clearTransferInfo = Game_Player.prototype.clearTransferInfo;
    Game_Player.prototype.clearTransferInfo = function() {
        
        if (IsConnected())
            Connection.invoke(PACKET.TRANSFER, this._lastMapId, this.getSyncData($gameMap.mapId(), this._newX, this._newY, this._newDirection));
        
        Game_Player_clearTransferInfo.call(this);
    }
    
    Game_Player.prototype.getSyncData = function(mapId, x, y, d) {
        
        if (!this.syncData) {
            
            this.syncData = {
                
                characterName:  this.characterName(),
                characterIndex: this.characterIndex(),
                pattern:        this.pattern(),
                animationCount: this._animationCount,
                mapId:          mapId || $gameMap.mapId(),
                x:              x     || this.worldX(),
                y:              y     || this.worldY(),
                direction:      d     || this.direction(),
                
                expression:      this.expression,
                expressionFrame: this.expressionFrame
            }
            
            return this.syncData;
        }
        
        this.syncData.characterName   = this.characterName();
        this.syncData.characterIndex  = this.characterIndex();
        this.syncData.pattern         = this.pattern();
        this.syncData.animationCount  = this._animationCount;
        
        this.syncData.mapId           = mapId || $gameMap.mapId();
        this.syncData.x               = x     || this.worldX();
        this.syncData.y               = y     || this.worldY();
        this.syncData.direction       = d     || this.direction();
        
        this.syncData.expression      = this.expression;
        this.syncData.expressionFrame = this.expressionFrame;
        
        return this.syncData;
    }

    Game_Player.prototype.worldX = function() {
        var tw = $gameMap.tileWidth();
        return Math.round(this._realX * tw + tw / 2);
    };
    
    Game_Player.prototype.worldY = function() {
        var th = $gameMap.tileHeight();
        return Math.round(this._realY * th + th - this.shiftY() - this.jumpHeight());
    };
    
    function Game_MultiPlayer() {
        
        this.initialize.apply(this, arguments);
    }
    
    Game_MultiPlayer.prototype = Object.create(Game_Character.prototype);
    
    var Game_MultiPlayer_initialize = Game_MultiPlayer.prototype.initialize;
    Game_MultiPlayer.prototype.initialize = function(syncData) {
        
        Game_MultiPlayer_initialize.call(this);
        this.applySyncData(syncData);
        
        this.setOpacity(160);
    }
    
    Game_MultiPlayer.prototype.update = function() {}
    
    Game_MultiPlayer.prototype.applySyncData = function(data) {
        
        try {
            
            this.connectionId = data.connectionId;
            this.setImage(data.characterName, data.characterIndex);
            this._pattern        = data.pattern;
            this._animationCount = data.animationCount;
            
            this.mapId  = data.mapId;
            this._realX = data.x;
            this._realY = data.y;
            this.setDirection(data.direction);
            
        } catch (err) {
            
        }
    }

    Game_MultiPlayer.prototype.scrolledX = function() {
        var tw = $gameMap.tileWidth();
        return $gameMap.adjustX(this._realX / tw - 0.5);
    };
    
    Game_MultiPlayer.prototype.scrolledY = function() {
        var th = $gameMap.tileHeight();
        return $gameMap.adjustY((this._realY + 6) / th - 1);
    };
    
    var HostAddress;
    var Connection;
    var ConnectionId;
    var RetryConnectionCount;
    
    function IsConnected() {
        
        return Connection && Connection.connectionState === "Connected";
    }
    
    var Players = {};
    
    var Connect = async function(address) {
        
        if (Connection)
            return;
        
        HostAddress = address = address || 'localhost';
        
        if (address === 'localhost' || address === '127.0.0.1')
            console.warn("You tried connect to local computer.");
        
        if (address.indexOf(':') === -1)
            address += ":14522";
        
        Connection = new signalR.HubConnectionBuilder()
            .withUrl("http://" + address + '/', {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();
        
        InitializeMessages();
        
        RetryConnectionCount = 0;
        await StartConnect();
    };
    
    async function StartConnect() {
        
        try {
            
            await Connection.start();
            OnConnect();
            
        } catch (err) {
            
            RetryConnectionCount++;
            Connection.stop();
            Connection = null;
            RetryConnectionToken = setTimeout(Connect, 10000, HostAddress);
            return;
        }
    }
    
    function OnConnect() {
        
        console.log("Connected");
        
        SetOnlineLabel(true);
        Players = {};
        RefreshAsyncMessages();
    }
    
    function SetOnlineLabel(status) {
        
        var style = OnlineStatus.style;
        
        if (status) {
            
            OnlineStatus.innerText = TUTStrings.Online;
            style.color = 'lime';
            
        } else {
            
            OnlineStatus.innerText = TUTStrings.Offline;
            style.color = 'red';
        }
    }
    
    function RefreshAsyncMessages(forceInit) {
        
        if (!IsConnected())
            return;
        
        console.log("refreshing messages...");
        
        LastLiveMessageFrame = Graphics.frameCount;
        GatherMessages(forceInit);
    }
    
    function GatherMessages(forceInit) {
        
        if (!IsConnected())
            return;
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            
            if (xhr.readyState != XMLHttpRequest.DONE)
                return;
            
            if (Math.floor(xhr.status / 100) != 2)
                return;
            
            var serverMessages = JSON.parse(xhr.responseText);
            
            if (!Array.isArray(serverMessages))
                return;
            
            var index;
            for (index = 0; index < LiveMessages.length; index++) {
                
                if (index >= serverMessages.length)
                    break;
                
                LiveMessages[index].ApplyServerData(serverMessages[index], forceInit);
            }
            
            while (index < LiveMessages.length) {
                
                LiveMessages[index].ApplyServerData(null, forceInit);
                index++;
            }
        }

        LastLiveMessageMapID = $gameMap.mapId();
        
        xhr.open("GET", Connection.connection.baseUrl + "comment?mapId=" + LastLiveMessageMapID);
        xhr.send();
    }
    
    function OnDisconnect(error) {
        
        console.log("Disconnected");
        SetOnlineLabel(false);
        
        RetryConnectionToken = setTimeout(Connect, 10000, HostAddress);
        
        Connection           = null;
        RetryConnectionCount = null;
        Players = {};
        LastLiveMessageMapID = 0;
        
        for (var message of LiveMessages)
            message.ApplyServerData(null, true);
        
        if (error)
            console.error(error);
    }
    
    function InitializeMessages() {
        
        Connection.connectionClosed = OnDisconnect;
        
        Connection.on(
            BROADCAST.INIT,
            function(connectionId) {
                
                ConnectionId = connectionId;
                Connection.invoke(PACKET.INITIAL_SYNC, $gamePlayer.getSyncData());
            }
        );
        
        Connection.on(BROADCAST.JOIN, (syncData) => { SyncData(syncData, true) });
        Connection.on(PACKET.SYNC,    SyncData);
        
        Connection.on(BROADCAST.LEAVE, OnLeave);
    }
    
    function SyncData(syncData, joined) {
        
        if (syncData.connectionId === ConnectionId)
            return;
        
        if (!(syncData.connectionId in Players) || joined) {
            
            console.log(syncData.connectionId + " is new one, creating...");
            Players[syncData.connectionId] = new Game_MultiPlayer(syncData);
            
            console.log("SceneManager._scene instanceof Scene_Map : " + (SceneManager._scene instanceof Scene_Map));
            if (SceneManager._scene instanceof Scene_Map)
                SceneManager._scene.addPlayer(Players[syncData.connectionId]);
            
            return;
        }
        
        var player = Players[syncData.connectionId];
        player.applySyncData(syncData);
    }
    
    function OnLeave(connectionId) {
        
        if (!(connectionId in Players))
            return;
        
        var player = Players[connectionId];
        delete Players[connectionId];
        
        if (player.mapId === $gameMap.mapId() && SceneManager._scene instanceof Scene_Map)
            SceneManager._scene.removePlayer(player);
    }
    
    var Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        
        Scene_Map_onMapLoaded.call(this);
    }
    
    Scene_Map.prototype.addPlayer = function(player) {
        
        if (!Connection || Connection.connectionState !== "Connected")
            return;
        
        if (player.connectionId === ConnectionId)
            return;
        
        console.log(player.connectionId + " is joining...");
        
        if (this._spriteset)
            this._spriteset.addPlayer(player);
        
        console.log("add requested : " + player.connectionId);
    };
    
    Scene_Map.prototype.removePlayer = function(player) {
        
        if (!Connection || Connection.connectionState !== "Connected")
            return;
        
        if (player.connectionId === ConnectionId)
            return;
        
        if(this._spriteset)
            this._spriteset.removePlayer(player);
        
        console.log("remove requested : " + player.connectionId);
    }
    
    var Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
    Scene_Map.prototype.isMenuEnabled = function() {
        return $gamePlayer.expression === TUT_EXPRESSION.NOTHING && Scene_Map_isMenuEnabled.call(this);
    }
    
    var Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        
        if (LastLiveMessageMapID !== $gameMap.mapId())
            RefreshAsyncMessages(true);
        
        if (Graphics.frameCount - LastLiveMessageFrame > 60 * 15)   //15 seconds
            RefreshAsyncMessages();
        
        Scene_Map_update.call(this);
    }
    
    var Spriteset_Map_createCharacters = Spriteset_Map.prototype.createCharacters;
    Spriteset_Map.prototype.createCharacters = function() {
        
        Spriteset_Map_createCharacters.call(this);
        this.players = {};
        
        if (!Connection || Connection.connectionState !== "Connected")
            return;
        
        for (var connectionId in Players)
            if (this.isValidMultiplayer(Players[connectionId]))
                this.addPlayer(Players[connectionId]);
        
        for (var message of LiveMessages) {
            
            this._characterSprites.push(message);
            this._tilemap.addChild(message);
        }
        
        console.log("created");
        console.log(Object.values(this.players));
    }
    
    
    var Spriteset_Map_update = Spriteset_Map.prototype.update;
    Spriteset_Map.prototype.update = function() {
        
        Spriteset_Map_update.call(this);
        
        var sprite;
        
        for (var key in this.players) {
            
            sprite = this.players[key];
            
            if (this.isValidMultiplayer(sprite._character))
                continue;
            
            this.removePlayer(sprite._character);
        }
    }
    
    Spriteset_Map.prototype.addPlayer = function(player) {
        
        console.log(player.connectionId + " is joining......");
        
        if (player.connectionId in this.players) {
            
            console.warn(player.connectionId + " is already joined!");
            return;
        }
        
        var sprite = new Sprite_Character(player);
        this._tilemap.addChild(sprite);
        
        this._characterSprites.push(sprite);
        this.players[player.connectionId] = sprite;
        
        console.log("added");
        console.log(Object.values(this.players));
    }
    
    Spriteset_Map.prototype.removePlayer = function(player) {
        
        if (!(player.connectionId in this.players))
            return;
        
        var sprite = this.players[player.connectionId];
        
        var index = this._characterSprites.findIndex(p => p._character === player);
        this._characterSprites.splice(index, 1);
        
        this._tilemap.removeChild(sprite);
        delete this.players[player.connectionId];
        
        console.log("removed");
        console.log(Object.values(this.players));
    }
    
    Spriteset_Map.prototype.clearAllPlayers = function() {
        
        for (var key in this.players)
            this.removePlayer(this.players[key]);
        
        console.log("clearAllPlayers");
        console.log(Object.values(this.players));
    }
    
    Spriteset_Map.prototype.isValidMultiplayer = function(character) {
        
        return character && character instanceof Game_MultiPlayer
            && character.connectionId !== ConnectionId
            && character.mapId === $gameMap.mapId();
    }
    
    var Window_MenuCommand_makeCommandList = Window_MenuCommand.prototype.makeCommandList;
    Window_MenuCommand.prototype.makeCommandList = function() {
        
        Window_MenuCommand_makeCommandList.call(this);
        this._list.splice(1, 0, { name: TUTStrings.Menu_Expression, symbol: "expression", enabled: true, ext: undefined});
        this._list.splice(2, 0, { name: TUTStrings.Menu_Message, symbol: "message", enabled: true, ext: undefined});
    }
    
    var Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        
        Scene_Menu_create.call(this);
        
        this._expressionWindow = new Window_Expressions();
        this._expressionWindow.setHandler("cancel", this.hideExpressionMenu.bind(this));
        this._expressionWindow.openness = 0;
        
        this._expressionWindow.command = this._commandWindow;
        
        this._expressionWindow.move(
            this._commandWindow.x + this._commandWindow.width, 0,
            Graphics.boxWidth - this._commandWindow.width, Graphics.boxHeight
        );
        this._expressionWindow.refresh();
        
        this.addWindow(this._expressionWindow);
        
        this._messageWindow = new Window_TUTMessage();
        this._messageWindow.setHandler("cancel", this.hideMessageMenu.bind(this));
        this._messageWindow.openness = 0;
        
        this._messageWindow.command = this._commandWindow;
        
        this._messageWindow.move(
            this._commandWindow.x + this._commandWindow.width, 0,
            Graphics.boxWidth - this._commandWindow.width, Graphics.boxHeight
        );
        this._messageWindow.refresh();
        
        this.addWindow(this._messageWindow);
    }
    
    var Scene_Menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function() {
        
        Scene_Menu_createCommandWindow.call(this);
        this._commandWindow.setHandler("expression", this.showExpressionMenu.bind(this));
        this._commandWindow.setHandler("message", this.showMessageMenu.bind(this));
    }
    
    Scene_Menu.prototype.showExpressionMenu = function() {
        
        this._expressionWindow.open();
        this._expressionWindow.activate();
        
        this._commandWindow.deactivate();
        
    }
    
    Scene_Menu.prototype.hideExpressionMenu = function() {
        
        this._expressionWindow.close();
        this._expressionWindow.deactivate();
        
        this._commandWindow.activate();
    }
    
    Scene_Menu.prototype.showMessageMenu = function() {
        
        this._messageWindow.open();
        this._messageWindow.activate();
        
        this._commandWindow.deactivate();
        
    }
    
    Scene_Menu.prototype.hideMessageMenu = function() {
        
        if (this._messageWindow.context != Window_TUTMessage.CONTEXT_MAIN) {
            
            this._messageWindow.returnToMain();
            return;
        }
        
        this._messageWindow.close();
        this._messageWindow.deactivate();
        
        this._commandWindow.activate();
    }
    
    function Window_Expressions() {
        
        this.initialize.apply(this, arguments);
    }
    
    var Expression_LastIndex = 0;
    Window_Expressions.prototype = Object.create(Window_Command.prototype);
    Window_Expressions.prototype.constructor = Window_Expressions;
    
    Window_Expressions.prototype.initialize = function() {
        
        Window_Command.prototype.initialize.apply(this, arguments);
        
        for (var key in EXPRESSION_PAIR)
            this.setHandler(key, this.onSelect.bind(this));
    }
    
    Window_Expressions.prototype.reselect = function() {
        this.select(Expression_LastIndex);
    };
    
    Window_Expressions.prototype.numVisibleCols = function() {
        return 4;
    };

    Window_Expressions.prototype.maxCols = function() {
        return 4;
    };

    Window_Expressions.prototype.drawItem = function(index) {
        var rect = this.itemRectForText(index);
        var align = this.itemTextAlign();
        this.resetTextColor();
        this.changePaintOpacity(this.isCommandEnabled(index));
        this.drawText(this.commandName(index), rect.x, rect.y, rect.width, align);
    };

    Window_Expressions.prototype.itemTextAlign = function() {
        return 'center';
    };
    
    Window_Expressions.prototype.makeCommandList = function() {
        
        for (var key in EXPRESSION_PAIR)
            this.addCommand(EXPRESSION_PAIR[key].name, key, true);
    }

    Window_Expressions.prototype.select = function(index) {
        
        Window_Command.prototype.select.call(this, index);
        
        if (this.active)
            Expression_LastIndex = index;
    };
    
    Window_Expressions.prototype.onSelect = function() {
        
        var symbol = this.currentSymbol();
        
        $gamePlayer.expression      = parseInt(symbol);
        $gamePlayer.expressionFrame = 0;
        $gamePlayer.cacheBeforeExpression();
        
        this.command._handlers.cancel.call(this.command);
    };
    
    function Window_TUTMessage() {
        
        this.initialize.apply(this, arguments);
    }
    
    Window_TUTMessage.prototype = Object.create(Window_Command.prototype);
    Window_TUTMessage.prototype.constructor = Window_TUTMessage;
    
    Window_TUTMessage.CONTEXT_MAIN        = 0;
    Window_TUTMessage.CONTEXT_WORD_BASE   = 1;
    Window_TUTMessage.CONTEXT_WORD        = 2;
    Window_TUTMessage.CONTEXT_ADVERB      = 3;
    Window_TUTMessage.CONTEXT_FAILED_POST = 4;
    
    Window_TUTMessage.prototype.initialize = function() {
        
        this.cursorContext = Window_TUTMessage.CONTEXT_TYPE;
        this.data = new TUTMessage();
        
        this.wordBaseSelectedCallback = null;
        this.wordSelectedCallback = null;
        this.adverbSelectedCallback = null;
        
        this.mainIndex = 0;
        this.wordCategoryIndex = 0;
        this.isSelectingWordId = false;
        
        this.isSelectingConfirm = false;
        
        this.context = Window_TUTMessage.CONTEXT_MAIN;
        
        Window_Command.prototype.initialize.apply(this, arguments);
    }
    
    Window_TUTMessage.prototype.makeCommandList = function() {
        
        switch (this.context) {
            
            case Window_TUTMessage.CONTEXT_MAIN:      this.makeMainCommands();     break;
            case Window_TUTMessage.CONTEXT_WORD_BASE: this.makeWordBaseCommands(); break;
            case Window_TUTMessage.CONTEXT_WORD:      this.makeWordCommands();     break;
            case Window_TUTMessage.CONTEXT_ADVERB:    this.makeAdverbCommands();   break;
        }
    }
    
    Window_TUTMessage.prototype.makeMainCommands = function() {
        
        this.addCommand(TUTStrings.Menu_MessageTypes[this.data.type], 'type', true);
        
        this.addCommand(TUTMessage.GetStringBase(this.data.firstWordBase), 'firstWordBase', true);
        this.addCommand(TUTMessage.GetStringWord(this.data.firstWordType, this.data.firstWordId), 'firstWord', true);
        
        if (this.data.type == MessageType.Two) {
            
            this.addCommand(TUTMessage.GetAdverb(this.data.adverb), 'adverb', true);
            
            this.addCommand(TUTMessage.GetStringBase(this.data.secondWordBase), 'secondWordBase', true);
            this.addCommand(TUTMessage.GetStringWord(this.data.secondWordType, this.data.secondWordId), 'secondWord', true);
        }
    }
    
    Window_TUTMessage.prototype.makeWordBaseCommands = function() {
        
        for (var base of TUTMessage.Data.base.list)
            this.addCommand(base, 'item', true);
    }
    
    Window_TUTMessage.prototype.makeWordCommands = function() {
        
        for (var categoryIndex = 0; categoryIndex < TUTMessage.Data.length; categoryIndex++)
            this.addCommand(TUTMessage.Data[categoryIndex].name, 'item', !this.isSelectingWordId);
        
        if (this.isSelectingWordId)
            for (var word of TUTMessage.Data[this.wordCategoryIndex].list)
                this.addCommand(word, 'item', true);
    }
    
    Window_TUTMessage.prototype.makeAdverbCommands = function() {
        
        for (var adverb of TUTMessage.Data.adverb.list)
            this.addCommand(adverb, 'item', true);
    }
    
    Window_TUTMessage.prototype.numVisibleCols = function() {
        
        switch (this.context) {
            
            default: return 6;
            
            case Window_TUTMessage.CONTEXT_WORD_BASE: return 4;
        }
    };

    Window_TUTMessage.prototype.maxCols = function() {
        
        switch (this.context) {
            
            default: return 6;
            
            case Window_TUTMessage.CONTEXT_WORD_BASE: return 4;
        }
    };
    
    Window_TUTMessage.prototype.drawAllItems = function() {
        
        if (this.context == Window_TUTMessage.CONTEXT_FAILED_POST) {
            
            var rect = this.itemRect(14.5);
            
            this.drawText(TUTStrings.Menu_MessageFailed, 0, this.lineHeight() * 2, this.width, 'center');
            this.drawText(TUTStrings.Menu_MessageFailedOk, rect.x, rect.y, rect.width, 'center');
            this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
            return;
        }
        
        this.drawDescription();
        this.drawHeaders();
        Window_Command.prototype.drawAllItems.call(this);
        
        if (this.context == Window_TUTMessage.CONTEXT_MAIN) {
            
            this.drawResult();
            this.drawConfirm();
        }
    };
    
    Window_TUTMessage.prototype.drawDescription = function() {
        
        this.drawText(TUTStrings.Menu_MessageTitle, 0, 0, this.width, 'center');
        this.drawText(TUTStrings.Menu_MessageNote, 0, this.lineHeight(), this.width, 'center');
    }
    
    Window_TUTMessage.prototype.drawHeaders = function() {
        
        var rect, align = this.itemTextAlign();
            
        switch (this.context) {
            
            case Window_TUTMessage.CONTEXT_MAIN:
                
                var range = TUTStrings.Menu_MessageHeaders.length;
                
                if (this.data.type == MessageType.One)
                    range -= 3; //adverb, base2, word2
                
                for (var index = 0; index < range; index++) {
                    
                    rect = this.itemRectForText(index);
                    rect.y -= this.lineHeight();
                    
                    this.resetTextColor();
                    this.drawText(TUTStrings.Menu_MessageHeaders[index], rect.x, rect.y, rect.width, align);
                }
                break;
            
            case Window_TUTMessage.CONTEXT_WORD_BASE:
                    
                rect = this.itemRectForText(0);
                rect.y -= this.lineHeight();
                
                this.drawText(TUTStrings.Menu_MessageSelectWordBase, rect.x, rect.y, this.contents.width, align);
                break;
            
            case Window_TUTMessage.CONTEXT_WORD:
                    
                rect = this.itemRectForText(0);
                rect.y -= this.lineHeight();
                
                this.drawText(TUTStrings.Menu_MessageSelectWord, rect.x, rect.y, this.contents.width, align);
                break;
            
            case Window_TUTMessage.CONTEXT_ADVERB:
                    
                rect = this.itemRectForText(0);
                rect.y -= this.lineHeight();
                
                this.drawText(TUTStrings.Menu_MessageSelectAdverb, rect.x, rect.y, this.contents.width, align);
                break;
        }
    }
    
    Window_TUTMessage.prototype.drawResult = function() {
        
        var rect = this.itemRectForText(6);
        var align = this.itemTextAlign();
        
        this.drawText(this.data.ToString(true), rect.x, rect.y, this.contents.width, align);
    }
    
    Window_TUTMessage.prototype.drawConfirm = function() {
        
        var rect = this.itemRectForText(14.5);
        var align = this.itemTextAlign();
        
        this.changePaintOpacity(IsConnected() && !this.data.ToString().contains("unknown"));
        this.drawText(TUTStrings.Menu_MessageConfirm, rect.x, rect.y, rect.width, align);
    }

    Window_TUTMessage.prototype.itemTextAlign = function() {
        return 'center';
    };
    
    Window_TUTMessage.prototype.itemRect = function(index) {
        var rect = new Rectangle();
        var maxCols = this.maxCols();
        rect.width = this.itemWidth();
        rect.height = this.itemHeight();
        rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
        rect.y = this.lineHeight() * 3 + Math.floor(index / maxCols) * rect.height - this._scrollY;
        return rect;
    };
    
    Window_TUTMessage.prototype.processOk = function() {
        
        switch (this.context) {
            
            default:
            case Window_TUTMessage.CONTEXT_MAIN:
                
                if (this.isSelectingConfirm) {
                    
                    this.postToServer();
                    return;
                }
                
                SoundManager.playOk();
                
                var symbol = this.currentSymbol();
                
                switch (symbol) {
                    
                    case 'type': this.changeType(); break;
                    
                    case 'firstWordBase':
                        this.startChangeWordBase((selected) => this.data.firstWordBase = selected);
                        break;
                        
                    case 'firstWord':
                        this.startChangeWord((type, id) => {
                            this.data.firstWordType = type;
                            this.data.firstWordId = id;
                        });
                        break;
                    
                    case 'adverb':
                        this.startChangeAdverb((selected) => this.data.adverb = selected);
                        break;
                    
                    case 'secondWordBase':
                        this.startChangeWordBase((selected) => this.data.secondWordBase = selected);
                        break;
                        
                    case 'secondWord':
                        this.startChangeWord((type, id) => {
                            this.data.secondWordType = type;
                            this.data.secondWordId = id;
                        });
                        break;
                }
                break;
            
            case Window_TUTMessage.CONTEXT_WORD_BASE:
        
                SoundManager.playOk();
                
                if (this.wordBaseSelectedCallback)
                    this.wordBaseSelectedCallback(this.index());
                
                this.returnToMain();
                break;
            
            case Window_TUTMessage.CONTEXT_WORD:
        
                SoundManager.playOk();
                
                if (!this.isSelectingWordId) {
                    
                    this.wordCategoryIndex = this.index();
                    
                    this.isSelectingWordId = true;
                    this.refresh();
                    this.select(6);
                    
                } else {
                    
                    if (this.index() < TUTMessage.Data.length)
                        return;
                    
                    if (this.wordSelectedCallback)
                        this.wordSelectedCallback(this.wordCategoryIndex, this.index() - TUTMessage.Data.length);
                    
                    this.returnToMain(true);
                }
                break;
            
            case Window_TUTMessage.CONTEXT_ADVERB:
        
                SoundManager.playOk();
                
                if (this.adverbSelectedCallback)
                    this.adverbSelectedCallback(this.index());
                
                this.returnToMain();
                
                break;
            
            case Window_TUTMessage.CONTEXT_FAILED_POST:
        
                SoundManager.playCancel();
                this.returnToMain();
                break;
        }
    };
    
    Window_TUTMessage.prototype.changeType = function() {
        
        this.data.type = this.data.type == MessageType.One ? MessageType.Two : MessageType.One;
        this.refresh();
    };
    
    Window_TUTMessage.prototype.startChangeWordBase = function(selectCallback) {
        
        this.wordBaseSelectedCallback = selectCallback;
        
        this.mainIndex = this.index();
        this.context = Window_TUTMessage.CONTEXT_WORD_BASE;
        
        this.refresh();
        this.select(0);
    }
    
    Window_TUTMessage.prototype.startChangeWord = function(selectCallback) {
        
        this.wordSelectedCallback = selectCallback;
        
        this.mainIndex = this.index();
        this.context = Window_TUTMessage.CONTEXT_WORD;
        this.isSelectingWordId = false;
        
        this.refresh();
        this.select(0);
    }
    
    Window_TUTMessage.prototype.startChangeAdverb = function(selectCallback) {
        
        this.adverbSelectedCallback = selectCallback;
        
        this.mainIndex = this.index();
        this.context = Window_TUTMessage.CONTEXT_ADVERB;
        
        this.refresh();
        this.select(0);
    }
    
    Window_TUTMessage.prototype.returnToMain = function(forceReturn) {
        
        this.activate();
        
        if (!forceReturn && this.context == Window_TUTMessage.CONTEXT_WORD && this.isSelectingWordId) {
            
            this.isSelectingWordId = false;
            
            this.refresh();
            this.select(this.wordCategoryIndex);
            return;
        }
        
        this.wordBaseSelectedCallback = null;
        this.wordSelectedCallback     = null;
        this.adverbSelectedCallback   = null;
        
        this.context = Window_TUTMessage.CONTEXT_MAIN;
        this.isSelectingConfirm = false;
        
        this.refresh();
        this.select(this.mainIndex);
    }
    
    Window_TUTMessage.prototype.cursorDown = function(wrap) {
        
        if (this.context != Window_TUTMessage.CONTEXT_MAIN) {
            
            Window_Command.prototype.cursorDown.call(this, wrap);
            return;
        }
        
        this.mainIndex = this.index();
        this.isSelectingConfirm = true;
        
        var rect = this.itemRect(14.5);
        this.setCursorRect(rect.x, rect.y, rect.width, rect.height);
    };

    Window_TUTMessage.prototype.cursorUp = function(wrap) {
        
        if (this.context != Window_TUTMessage.CONTEXT_MAIN) {
            
            Window_Command.prototype.cursorUp.call(this, wrap);
            return;
        }
        
        this.isSelectingConfirm = false;
        this.select(this.mainIndex);
    };
    
    Window_TUTMessage.prototype.postToServer = function() {
        
        if (!IsConnected()) {
            
            SoundManager.playBuzzer();
            return;
        }
        
        if (this.data.ToString().contains("unknown")) {
            
            SoundManager.playBuzzer();
            return;
        }
        
        SoundManager.playOk();
        
        this.drawText(TUTStrings.Menu_MessagePosting, 0, this.lineHeight() * 6, this.contents.width, 'center');
        
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = (function() {
        
            if (xhr.readyState != XMLHttpRequest.DONE)
                return;
            
            this.activate();
            
            if (Math.floor(xhr.status / 100) != 2) {
                
                SoundManager.playBuzzer();
                
                console.error("Failed to post comment on server");
                
                this.context = Window_TUTMessage.CONTEXT_FAILED_POST;
                this.refresh();
                return;
            }
        
            SoundManager.playSave();
            
            console.log("Successfully posted comment on server : " + this.data.ToString());
            
            //Exit to map
            this.command._handlers.cancel.call(this.command);
            
            //Display message
            $gameMessage.add('\n\\C[7]' + TUTStrings.Menu_MessageSent + "\n\\>\\C[0]'" + this.data.ToString() + "'");
            $gameMessage.setPositionType(1);
        }).bind(this);
        
        xhr.open("POST", Connection.connection.baseUrl + "comment");
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        var serverData = this.data.CreateServerData();
        xhr.send(JSON.stringify(serverData));
        
        LastLiveMessageFrame = Graphics.frameCount;
        
        for (var message of LiveMessages)
            if (!message.data.hasServerData) {
                
                message.ApplyServerData(serverData);
                break;
            }
        
        this.deactivate();
    }
    
    var init = setInterval(function() {
        
        if ($gamePlayer) {
            
            clearInterval(init);
            Connect(Address);
        }
    });
    
    Scene_Boot.prototype.terminate = function() {
        
        for (var i = 0; i < LIVE_MESSAGE_COUNT; i++)
            LiveMessages.push(new Sprite_TUTMessage());
        
        OnlineStatus = document.createElement('span');
        var style = OnlineStatus.style;
        
        style.zIndex = 1000;
        style.position = 'absolute';
        
        style.top  = '1px';
        style.left = '1px';
        style.padding = '1px 3px 2px 3px';
        style.fontSize = '0.9em';
        style.backgroundColor = 'black';
        style.borderRadius = '5px';
        style.opacity = '0.75';
        
        document.body.appendChild(OnlineStatus);
        
        SetOnlineLabel(false);
    }
})();