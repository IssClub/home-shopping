import time,json,re,subprocess,gzip,io,sys,http.cookiejar,urllib.request,urllib.parse,xml.etree.ElementTree as ET
B='https://url.publishedprices.co.il'
def retry(f,n=6):
    for i in range(n):
        try: return f()
        except Exception as e:
            if i==n-1: raise
            time.sleep(2+i*3)
class Client:
    def __init__(s,user):
        def go():
            s.cj=http.cookiejar.CookieJar();s.op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(s.cj))
            h=s.op.open(B+'/login',timeout=40).read().decode()
            t=re.search(r'name="csrftoken" content="([^"]*)"',h).group(1)
            s.op.open(urllib.request.Request(B+'/login/user',urllib.parse.urlencode({'username':user,'password':'','csrftoken':t,'r':''}).encode()),timeout=40).read()
            h=s.op.open(B+'/file',timeout=40).read().decode()
            s.tok=re.search(r'name="csrftoken" content="([^"]*)"',h).group(1)
        retry(go)
    def ls(s):
        d=urllib.parse.urlencode({'sEcho':1,'iDisplayStart':0,'iDisplayLength':100000,'cd':'/','csrftoken':s.tok}).encode()
        return retry(lambda:json.load(s.op.open(urllib.request.Request(B+'/file/json/dir',d),timeout=60))['aaData'])
    def get(s,fname):
        raw=retry(lambda:s.op.open(B+'/file/d/'+urllib.parse.quote(fname),timeout=120).read())
        try: raw=gzip.decompress(raw)
        except Exception: pass
        return raw
