### Prepare JSON data for data story
### Yuqi Liao
### 12/12/19

### Set thigns up
library(jsonlite)
library(readr)
library(dplyr)
library(tidyr)
library(stringr)

getwd()

outputFiles <- list.files(path = "./output")

### 1
outputFile <- str_subset(outputFiles, pattern = "eachModule_adClickSummaryTable.csv")

data <- read_csv(file = paste0("./output/", outputFile))

jsonData <- toJSON(data)
write_lines(jsonData, path = paste0("./data story/data/", "data1"))
        
### 2
outputFile <- str_subset(outputFiles, pattern = "eachModule_erea_adClick_pct.csv")
data <- read_csv(file = paste0("./output/", outputFile)) %>% 
  filter(EqVarValue == 1) %>% 
  separate(col = "EqVar", into = c("Var", "VarSuffix"), sep = 8)

jsonData <- toJSON(data)
write(jsonData, file = paste0("./data story/data/", "data2"))

### 3
outputFile <- str_subset(outputFiles, pattern = "allModule_erea_adClickTotal_pct.csv")
data <- read_csv(file = paste0("./output/", outputFile)) %>% 
  filter(EqVarValue == 1)

jsonData <- toJSON(data)
write(jsonData, file = paste0("./data story/data/", "data3"))

### 4
outputFile <- str_subset(outputFiles, pattern = "erea_itsex_adClickTotal_pct.csv")
data <- read_csv(file = paste0("./output/", outputFile)) %>% 
  filter(EqVar2Value == 1)

jsonData <- toJSON(data)
write(jsonData, file = paste0("./data story/data/", "data4"))

### 5 (similar to 3)
outputFile <- str_subset(outputFiles, pattern = "allModule_erea_adClickTotal_pct.csv")
#calculate gap between yesClicks and noClicks
data1 <- read_csv(file = paste0("./output/", outputFile)) %>% 
        filter(EqVarValue == 1)
data <- read_csv(file = paste0("./output/", outputFile)) %>% 
  filter(EqVarValue == 0) %>% 
  left_join(data1, by = "IDCNTRY", suffix = c(".NO", ".YES")) %>% 
  mutate(MEAN.GAP = MEAN.NO - MEAN.YES)
jsonData <- toJSON(data)
write(jsonData, file = paste0("./data story/data/", "data5"))

### 6
outputFile <- str_subset(outputFiles, pattern = "allModule_timeVars_adClickTotal.csv")

data_l_noClick <- read_csv(file = paste0("./output/", outputFile)) %>% 
  filter(EqVar == "(Intercept)" & YVar == "en11Totaltiml_seconds") %>% ##en11Totaltiml_seconds: total assessment duration from start to logout 
  select(IDCNTRY, coef, pVal) %>% 
  rename(Coef_startToLogout_noClick = coef,
         pVal_startToLogout_noClick = pVal) %>% 
  mutate(Coef_startToLogout_noClick_min = Coef_startToLogout_noClick/60)

data_l_gap <- read_csv(file = paste0("./output/", outputFile)) %>% 
  filter(EqVar == "adClickTotal_d_clicked1" & YVar == "en11Totaltiml_seconds") %>% ##en11Totaltiml_seconds: total assessment duration from start to logout 
  select(IDCNTRY, coef, pVal) %>% 
  rename(Coef_startToLogout_gap = coef,
         pVal_startToLogout_gap = pVal) %>% 
  mutate(Coef_startToLogout_gap_min = Coef_startToLogout_gap/60)


data <- data_l_noClick %>% 
  left_join(data_l_gap, by = "IDCNTRY") %>% 
  mutate(Coef_startToLogout_yesClick = Coef_startToLogout_noClick + Coef_startToLogout_gap,
         Coef_startToLogout_yesClick_min = Coef_startToLogout_noClick_min + Coef_startToLogout_gap_min,
         pValSig = ifelse(pVal_startToLogout_gap < 0.05, TRUE, FALSE))

jsonData <- toJSON(data)
write(jsonData, file = paste0("./data story/data/", "data6"))


