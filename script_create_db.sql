CREATE TABLE ingredients (                  
     nbd_num            int PRIMARY KEY,
     name               varchar(60),
     kcals              decimal,
     protein            decimal,
     fat                decimal,
     carbohydrates      decimal,
     fiber              decimal,
     calcium            decimal,
     iron               decimal,
     magnesium          decimal,
     phosphorous        decimal,
     potassium          decimal,
     sodium             decimal,
     zinc               decimal,
     copper             decimal,
     manganese          decimal,
     selenium           decimal,
     vitc               decimal,
     thiamin            decimal,
     riboflavin         decimal,
     niacin             decimal,
     pantothenic_acid   decimal,
     vitb6              decimal,
     folate             decimal,
     choline            decimal,
     vitb12             decimal,
     vita               decimal,
     vite               decimal,
     vitd               decimal,
     vitK               decimal,
     cholesterol        decimal,
     gmwt_1             decimal,
     gmwt_1_desc        text,   
     gmwt_2             decimal,
     gmwt_2_desc        text
 );

CREATE TABLE users (
    user_name    varchar(20) PRIMARY KEY,  
    friends     text                       
);

CREATE TABLE recipes (                    
    ID             int PRIMARY KEY,
    recipe_name    text,                                       
    url            text,                   
    image          text,                   
    cook_time      time,                   
    recipe_yield   int,                    
    date_published date,                   
    prep_time      time,                   
    description    text                    
);

CREATE TABLE pantries (                   
    pantry_ID     integer,                       
    pantry_name   varchar(20),             
    owner_name    varchar(20),             
    ingredient_ID int,                     
    amount        int,                     
    PRIMARY KEY (pantry_ID, ingredient_ID) 
);

CREATE TABLE friends (
    username_1    varchar(20),
    username_2    varchar(20),
    PRIMARY KEY (username_1, username_2)
);

CREATE TABLE recipe_ingredients (
    recipe_ID        int,
    ingredient_ID    int,
    amount           int
);