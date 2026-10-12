#!/usr/bin/env python3
import pathlib,subprocess
root=pathlib.Path(__file__).resolve().parents[1];out=root/'build/logic-tests';out.mkdir(parents=True,exist_ok=True)
subprocess.run(['java','-m','jdk.compiler/com.sun.tools.javac.Main','-d',str(out),str(root/'app/src/main/java/app/protocolo/android/EventTiming.java'),str(root/'app/src/main/java/app/protocolo/android/ActivitySchedule.java'),str(root/'tests/EventTimingTest.java'),str(root/'tests/ActivityScheduleTest.java')],check=True)
for test in ('EventTimingTest','ActivityScheduleTest'):subprocess.run(['java','-cp',str(out),test],check=True)
